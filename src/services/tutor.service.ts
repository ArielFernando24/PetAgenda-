import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { CreateTutorInput, UpdateTutorInput } from '../schemas/tutor.schema';

import { storageService } from './storage.service';

export interface TutorResponse {
  id: string;
  nome: string;
  email: string;
  telefone?: string | null;
  bio?: string | null;
  timezone?: string | null;
  avatarUrl?: string | null;
  avatarThumb128?: string | null;
  avatarThumb256?: string | null;
  data_criacao: Date;
}

export class TutorService {
  public async createTutor(data: CreateTutorInput): Promise<TutorResponse> {
    const existingTutor = await prisma.tutor.findUnique({
      where: { email: data.email },
    });

    if (existingTutor) {
      throw new AppError('Já existe um tutor cadastrado com este e-mail', 409);
    }

    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(data.senha, saltRounds);

    const tutor = await prisma.tutor.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha_hash,
      },
    });

    return {
      id: tutor.id,
      nome: tutor.nome,
      email: tutor.email,
      telefone: (tutor as any).telefone ?? null,
      bio: (tutor as any).bio ?? null,
      timezone: (tutor as any).timezone ?? 'America/Sao_Paulo',
      avatarUrl: (tutor as any).avatarUrl ?? null,
      avatarThumb128: (tutor as any).avatarThumb128 ?? null,
      avatarThumb256: (tutor as any).avatarThumb256 ?? null,
      data_criacao: tutor.data_criacao,
    };
  }

  public async getTutorById(id: string, tokenVersion?: number): Promise<TutorResponse> {
    const tutor = await prisma.tutor.findUnique({
      where: { id },
    });

    if (!tutor) {
      throw new AppError('Tutor não encontrado', 404);
    }

    if (tokenVersion !== undefined && (tutor as any).tokenVersion !== undefined && tokenVersion !== (tutor as any).tokenVersion) {
      throw new AppError('Sessão expirada ou revogada. Faça login novamente.', 401);
    }

    return {
      id: tutor.id,
      nome: tutor.nome,
      email: tutor.email,
      telefone: (tutor as any).telefone ?? null,
      bio: (tutor as any).bio ?? null,
      timezone: (tutor as any).timezone ?? 'America/Sao_Paulo',
      avatarUrl: (tutor as any).avatarUrl ?? null,
      avatarThumb128: (tutor as any).avatarThumb128 ?? null,
      avatarThumb256: (tutor as any).avatarThumb256 ?? null,
      data_criacao: tutor.data_criacao,
    };
  }

  public async updateTutor(id: string, data: UpdateTutorInput): Promise<TutorResponse> {
    const tutor = await prisma.tutor.findUnique({
      where: { id },
    });

    if (!tutor) {
      throw new AppError('Tutor não encontrado', 404);
    }

    const updateData: {
      nome?: string;
      telefone?: string | null;
      bio?: string | null;
      timezone?: string | null;
      senha_hash?: string;
    } = {};

    if (data.nome !== undefined) {
      updateData.nome = data.nome.trim();
    }
    if (data.telefone !== undefined) {
      updateData.telefone = data.telefone.trim();
    }
    if (data.bio !== undefined) {
      updateData.bio = data.bio.trim();
    }
    if (data.timezone !== undefined) {
      updateData.timezone = data.timezone.trim();
    }

    if (data.novaSenha) {
      if (!data.senhaAtual) {
        throw new AppError('Para alterar a senha, informe a senha atual', 400);
      }

      const isCurrentPasswordValid = await bcrypt.compare(data.senhaAtual, tutor.senha_hash);
      if (!isCurrentPasswordValid) {
        throw new AppError('A senha atual fornecida está incorreta', 401);
      }

      const saltRounds = 10;
      updateData.senha_hash = await bcrypt.hash(data.novaSenha, saltRounds);
    }

    const updatedTutor = await prisma.tutor.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedTutor.id,
      nome: updatedTutor.nome,
      email: updatedTutor.email,
      telefone: (updatedTutor as any).telefone ?? null,
      bio: (updatedTutor as any).bio ?? null,
      timezone: (updatedTutor as any).timezone ?? 'America/Sao_Paulo',
      avatarUrl: (updatedTutor as any).avatarUrl ?? null,
      avatarThumb128: (updatedTutor as any).avatarThumb128 ?? null,
      avatarThumb256: (updatedTutor as any).avatarThumb256 ?? null,
      data_criacao: updatedTutor.data_criacao,
    };
  }

  public async updateAvatar(id: string, buffer: Buffer, mimetype: string): Promise<TutorResponse> {
    const tutor = await prisma.tutor.findUnique({
      where: { id },
    });

    if (!tutor) {
      throw new AppError('Tutor não encontrado', 404);
    }

    // Limpar fotos antigas do storage para evitar acúmulo de lixo
    const currentAvatarUrl = (tutor as any).avatarUrl;
    const currentThumb128 = (tutor as any).avatarThumb128;
    const currentThumb256 = (tutor as any).avatarThumb256;

    if (currentAvatarUrl || currentThumb128 || currentThumb256) {
      await storageService.deleteAvatarFiles([currentAvatarUrl, currentThumb128, currentThumb256]);
    }

    // Salvar nova imagem com redimensionamento de thumbnails (128x128 e 256x256)
    const processed = await storageService.saveAvatar(id, buffer, mimetype);

    const updatedTutor = await prisma.tutor.update({
      where: { id },
      data: {
        avatarUrl: processed.avatarUrl,
        avatarThumb128: processed.avatarThumb128,
        avatarThumb256: processed.avatarThumb256,
      },
    });

    return {
      id: updatedTutor.id,
      nome: updatedTutor.nome,
      email: updatedTutor.email,
      telefone: (updatedTutor as any).telefone ?? null,
      bio: (updatedTutor as any).bio ?? null,
      timezone: (updatedTutor as any).timezone ?? 'America/Sao_Paulo',
      avatarUrl: (updatedTutor as any).avatarUrl ?? null,
      avatarThumb128: (updatedTutor as any).avatarThumb128 ?? null,
      avatarThumb256: (updatedTutor as any).avatarThumb256 ?? null,
      data_criacao: updatedTutor.data_criacao,
    };
  }
}

export const tutorService = new TutorService();
