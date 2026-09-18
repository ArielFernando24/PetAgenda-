import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { LoginInput, ResetPasswordInput } from '../schemas/auth.schema';
import { TutorResponse } from './tutor.service';
import { mailService } from './mail.service';

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
        token_version: tutor.tokenVersion ?? 1,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
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

  public async forgotPassword(email: string): Promise<void> {
    const tutor = await prisma.tutor.findUnique({
      where: { email },
    });

    // Se o usuário não existir, retornamos silenciosamente (feedback neutro contra enumeração)
    if (!tutor) {
      return;
    }

    // Gerar token aleatório seguro de 32 bytes (64 chars hex)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Salvar token com hash e TTL no banco de dados
    await prisma.passwordResetToken.create({
      data: {
        tutorId: tutor.id,
        tokenHash,
        expiresAt,
      },
    });

    // Enviar e-mail via serviço transacional
    await mailService.sendPasswordResetEmail(tutor.email, rawToken, tutor.nome);
  }

  public async resetPassword(data: ResetPasswordInput): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken) {
      throw new AppError('Token de recuperação inválido ou não encontrado', 400);
    }

    if (resetToken.usedAt) {
      throw new AppError('Este token de recuperação já foi utilizado', 400);
    }

    if (new Date() > resetToken.expiresAt) {
      throw new AppError('Token de recuperação expirado. Solicite um novo link', 400);
    }

    // Hashear nova senha
    const senha_hash = await bcrypt.hash(data.novaSenha, 10);

    // Atualizar senha do tutor e incrementar tokenVersion para revogar sessões ativas
    await prisma.tutor.update({
      where: { id: resetToken.tutorId },
      data: {
        senha_hash,
        tokenVersion: { increment: 1 },
      },
    });

    // Marcar token como utilizado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: new Date(),
      },
    });
  }
}

export const authService = new AuthService();

