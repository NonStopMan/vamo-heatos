import { LeadsUploadsController } from './uploads.controller';

describe('LeadsUploadsController', () => {
  it('returns urls for uploaded files', () => {
    const controller = new LeadsUploadsController();
    const result = controller.upload(
      [
        { filename: 'file-a.jpg' } as Express.Multer.File,
        { filename: 'file-b.png' } as Express.Multer.File,
      ],
      {
        protocol: 'http',
        get: () => 'localhost:3000',
      } as never,
    );

    expect(result).toEqual({
      urls: ['http://localhost:3000/uploads/file-a.jpg', 'http://localhost:3000/uploads/file-b.png'],
    });
  });
});
