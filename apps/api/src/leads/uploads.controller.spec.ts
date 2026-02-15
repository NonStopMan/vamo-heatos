import { BlobServiceClient } from '@azure/storage-blob';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeadsUploadsController } from './uploads.controller';

jest.mock('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn(),
  },
}));

describe('LeadsUploadsController', () => {
  const buildMocks = () => {
    const uploadData = jest.fn().mockResolvedValue(undefined);
    const getBlockBlobClient = jest.fn((name: string) => ({
      url: `https://example.blob.core.windows.net/leads/${name}`,
      uploadData,
    }));
    const createIfNotExists = jest.fn().mockResolvedValue(undefined);
    const getContainerClient = jest.fn(() => ({
      createIfNotExists,
      getBlockBlobClient,
    }));
    (BlobServiceClient.fromConnectionString as jest.Mock).mockReturnValue({
      getContainerClient,
    });
    return { uploadData, getBlockBlobClient, createIfNotExists, getContainerClient };
  };

  const buildConfig = (values: Record<string, string | undefined>) =>
    ({
      get: (key: string) => values[key],
    }) as unknown as ConfigService;

  it('returns urls for uploaded files', async () => {
    const config = buildConfig({
      AZURE_STORAGE_CONNECTION_STRING: 'UseDevelopmentStorage=true',
      AZURE_STORAGE_CONTAINER: 'leads',
    });
    const { uploadData } = buildMocks();
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.123456);

    const controller = new LeadsUploadsController(config);
    const result = await controller.upload(
      [
        {
          originalname: 'file-a.jpg',
          buffer: Buffer.from('a'),
          mimetype: 'image/jpeg',
        } as Express.Multer.File,
        {
          originalname: 'file-b.png',
          buffer: Buffer.from('b'),
          mimetype: 'image/png',
        } as Express.Multer.File,
      ],
      {
        requestId: 'req-1',
        headers: {},
        ip: '127.0.0.1',
      } as never,
    );

    expect(result.urls).toHaveLength(2);
    expect(result.urls[0]).toContain('https://example.blob.core.windows.net/leads/');
    expect(result.urls[1]).toContain('https://example.blob.core.windows.net/leads/');
    expect(uploadData).toHaveBeenCalledTimes(2);
    nowSpy.mockRestore();
    randomSpy.mockRestore();
  });

  it('throws internal server error when config is missing', async () => {
    const config = buildConfig({});

    const controller = new LeadsUploadsController(config);

    await expect(
      controller.upload(
        [
          {
            originalname: 'file-a.jpg',
            buffer: Buffer.from('a'),
            mimetype: 'image/jpeg',
          } as Express.Multer.File,
        ],
        {
          requestId: 'req-1',
          headers: {},
          ip: '127.0.0.1',
        } as never,
      ),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
