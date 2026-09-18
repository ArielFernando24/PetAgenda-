import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';
import { CreateTutorInput, UpdateTutorInput } from '../schemas/tutor.schema';

export interface TutorResponse {
  id: string;
  nome: string;
  email: string;
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

    const updateData: { nome?: string; senha_hash?: string } = {};

    if (data.nome) {
      updateData.nome = data.nome;
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
      data_criacao: updatedTutor.data_criacao,
    };
  }
}

export const tutorService = new TutorService();
