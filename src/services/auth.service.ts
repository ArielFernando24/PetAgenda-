import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { LoginInput } from '../schemas/auth.schema';
import { TutorResponse } from './tutor.service';

export interface LoginResponse {
  token: string;
  tutor: TutorResponse;
}

export class AuthService {
  public async login(data: LoginInput): Promise<LoginResponse> {
    const tutor = await prisma.tutor.findUnique({
      where: { email: data.email },
    });

    if (!tutor) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.senha, tutor.senha_hash);

    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const token = jwt.sign(
      {
        tutor_id: tutor.id,
        email: tutor.email,
      },
      env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    return {
      token,
      tutor: {
        id: tutor.id,
        nome: tutor.nome,
        email: tutor.email,
        data_criacao: tutor.data_criacao,
      },
    };
  }
}

export const authService = new AuthService();
