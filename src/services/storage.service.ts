import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import crypto from 'node:crypto';
import { env } from '../config/env';

export interface ProcessedAvatarResult {
  avatarUrl: string;
  avatarThumb128: string;
  avatarThumb256: string;
}

export interface IStorageService {
  saveAvatar(tutorId: string, buffer: Buffer, mimetype: string): Promise<ProcessedAvatarResult>;
  deleteAvatarFiles(urls: (string | null | undefined)[]): Promise<void>;
  generatePresignedUploadUrl(tutorId: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }>;
}

export class StorageService implements IStorageService {
  private uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || path.resolve(process.cwd(), 'public/uploads/avatars');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public async saveAvatar(tutorId: string, buffer: Buffer, mimetype: string): Promise<ProcessedAvatarResult> {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(6).toString('hex');
    const baseName = `${tutorId}_${timestamp}_${randomHash}`;

    let ext = 'webp';
    if (mimetype === 'image/jpeg') ext = 'jpg';
    else if (mimetype === 'image/png') ext = 'png';
    else if (mimetype === 'image/webp') ext = 'webp';

    const mainFileName = `${baseName}_main.${ext}`;
    const thumb256FileName = `${baseName}_256.${ext}`;
    const thumb128FileName = `${baseName}_128.${ext}`;

    const mainFilePath = path.join(this.uploadDir, mainFileName);
    const thumb256FilePath = path.join(this.uploadDir, thumb256FileName);
    const thumb128FilePath = path.join(this.uploadDir, thumb128FileName);

    // 1. Imagem Principal (max 512x512 mantendo proporção)
    await sharp(buffer)
      .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
      .toFile(mainFilePath);

    // 2. Thumbnail 256x256 (quadrada, centro)
    await sharp(buffer)
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .toFile(thumb256FilePath);

    // 3. Thumbnail 128x128 (quadrada, centro)
    await sharp(buffer)
      .resize(128, 128, { fit: 'cover', position: 'center' })
      .toFile(thumb128FilePath);

    const baseUrl = env.STORAGE_BASE_URL.replace(/\/+$/, '');

    return {
      avatarUrl: `${baseUrl}/${mainFileName}`,
      avatarThumb256: `${baseUrl}/${thumb256FileName}`,
      avatarThumb128: `${baseUrl}/${thumb128FileName}`,
    };
  }

  public async deleteAvatarFiles(urls: (string | null | undefined)[]): Promise<void> {
    for (const url of urls) {
      if (!url) continue;
      try {
        const fileName = path.basename(url.split('?')[0]);
        const filePath = path.join(this.uploadDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn(`[StorageService] Não foi possível remover arquivo antigo: ${url}`, err);
      }
    }
  }

  public async generatePresignedUploadUrl(tutorId: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(6).toString('hex');
    const ext = contentType.split('/')[1] || 'webp';
    const fileKey = `avatars/${tutorId}_${timestamp}_${randomHash}.${ext}`;

    if (env.STORAGE_PROVIDER === 's3') {
      // Placeholder configurável para AWS S3 PutObjectCommand presigned URL
      return {
        uploadUrl: `https://s3.amazonaws.com/petagenda-storage/${fileKey}?mock-presigned=true`,
        fileKey,
      };
    }

    // Provedor local: endpoint direto de upload
    return {
      uploadUrl: `/api/users/me/avatar`,
      fileKey,
    };
  }
}

export const storageService = new StorageService();
