import {
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BlobServiceClient } from '@azure/storage-blob';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

const storage = memoryStorage();

@Controller('leads')
@UseGuards(ApiKeyGuard)
@Throttle({ default: { limit: 20, ttl: 60 } })
export class LeadsUploadsController {
  private readonly logger = new Logger(LeadsUploadsController.name);

  constructor(private readonly config: ConfigService) {}

  private getContainerClient() {
    const connectionString = this.config.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    const containerName = this.config.get<string>('AZURE_STORAGE_CONTAINER');
    if (!connectionString || !containerName) {
      throw new Error('Azure storage configuration is missing');
    }
    const service = BlobServiceClient.fromConnectionString(connectionString);
    return service.getContainerClient(containerName);
  }

  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: Request,
  ) {
    const fileCount = files?.length ?? 0;
    this.logger.log(
      `Uploading ${fileCount} picture(s) to Azure Blob Storage (requestId=${request.requestId})`,
    );

    try {
      const containerClient = this.getContainerClient();
      await containerClient.createIfNotExists({ access: 'blob' });
      const uploads = (files ?? []).map(async (file) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const blobName = `${unique}${extname(file.originalname)}`;
        const blobClient = containerClient.getBlockBlobClient(blobName);
        await blobClient.uploadData(file.buffer, {
          blobHTTPHeaders: { blobContentType: file.mimetype },
        });
        return blobClient.url;
      });
      const urls = await Promise.all(uploads);
      this.logger.log(
        `Uploaded ${urls.length} picture(s) successfully (requestId=${request.requestId})`,
      );
      return { urls };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Picture upload failed: ${message} (requestId=${request.requestId})`,
        stack,
      );
      throw new InternalServerErrorException({
        reason: 'Internal Server Error',
        issues: [],
      });
    }
  }
}
