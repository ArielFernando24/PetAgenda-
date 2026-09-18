import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('FORMATO_INVALIDO: Formato de arquivo não suportado. Envie apenas imagens nos formatos JPG, PNG ou WebP.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter,
});

export const avatarUploadMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const singleUpload = upload.single('avatar');

  singleUpload(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          status: 'error',
          code: 'FILE_TOO_LARGE',
          message: 'Fotos com mais de 2MB são rejeitadas. Por favor, compacte a imagem antes de enviar.',
        });
        return;
      }

      if (err.message && err.message.startsWith('FORMATO_INVALIDO:')) {
        res.status(400).json({
          status: 'error',
          code: 'INVALID_FILE_FORMAT',
          message: err.message.replace('FORMATO_INVALIDO: ', ''),
        });
        return;
      }

      res.status(400).json({
        status: 'error',
        code: 'UPLOAD_ERROR',
        message: err.message || 'Erro ao processar o upload do arquivo.',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        code: 'MISSING_FILE',
        message: 'Nenhum arquivo de imagem foi enviado no campo "avatar".',
      });
      return;
    }

    next();
  });
};
