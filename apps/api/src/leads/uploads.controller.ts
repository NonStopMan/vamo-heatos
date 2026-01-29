import {
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { type Request } from 'express';

const uploadDir = join(__dirname, '..', 'uploads');
mkdirSync(uploadDir, { recursive: true });

const storage = diskStorage({
  destination: uploadDir,
  filename: (_req, file, callback) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `${unique}${extname(file.originalname)}`);
  },
});

@Controller('leads')
export class LeadsUploadsController {
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files', 10, { storage }))
  upload(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = (files ?? []).map(
      (file) => `${baseUrl}/uploads/${file.filename}`,
    );
    return { urls };
  }
}
