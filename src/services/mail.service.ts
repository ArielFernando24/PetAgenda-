import { env } from '../config/env';

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface IMailService {
  sendPasswordResetEmail(to: string, token: string, tutorNome: string): Promise<void>;
  sendMail(options: SendMailOptions): Promise<void>;
}

export class MailService implements IMailService {
  private sentEmails: SendMailOptions[] = [];

  public async sendMail(options: SendMailOptions): Promise<void> {
    this.sentEmails.push(options);

    if (env.NODE_ENV === 'test') {
      return;
    }

    if (env.MAIL_PROVIDER === 'ses' || env.MAIL_PROVIDER === 'sendgrid') {
      // Plug-in pronto para provedor transacional externo (SendGrid / AWS SES)
      console.log(`[MailService:${env.MAIL_PROVIDER}] Disparando e-mail para ${options.to}: ${options.subject}`);
      return;
    }

    // Default: console / dev
    console.log('----------------------------------------------------');
    console.log(`[MailService:DEV] Para: ${options.to}`);
    console.log(`[MailService:DEV] Assunto: ${options.subject}`);
    console.log(`[MailService:DEV] Conteúdo: \n${options.text}`);
    console.log('----------------------------------------------------');
  }

  public async sendPasswordResetEmail(to: string, token: string, tutorNome: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const subject = 'PetAgenda — Recuperação de Senha';

    const text = `Olá, ${tutorNome || 'Tutor'}.\n\n` +
      `Recebemos uma solicitação para redefinir a senha da sua conta no PetAgenda.\n` +
      `Para continuar, acesse o link seguro abaixo (válido por 30 minutos):\n\n` +
      `${resetUrl}\n\n` +
      `Se você não solicitou a redefinição de senha, ignore este e-mail com segurança.\n\n` +
      `Atenciosamente,\nEquipe PetAgenda`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2b6cb0;">PetAgenda — Recuperação de Senha</h2>
        <p>Olá, <strong>${tutorNome || 'Tutor'}</strong>,</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no PetAgenda.</p>
        <p>Clique no botão abaixo para cadastrar uma nova senha. Este link expira em <strong>30 minutos</strong>:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3182ce; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
        </div>
        <p style="color: #718096; font-size: 13px;">Caso o botão não funcione, copie e cole o link a seguir no seu navegador:</p>
        <p style="color: #4a5568; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #a0aec0; font-size: 12px;">Se você não solicitou esta redefinição, fique tranquilo: nenhuma alteração foi realizada em sua conta.</p>
      </div>
    `;

    await this.sendMail({
      to,
      subject,
      text,
      html,
    });
  }

  public getSentEmails(): SendMailOptions[] {
    return this.sentEmails;
  }

  public clearSentEmails(): void {
    this.sentEmails = [];
  }
}

export const mailService = new MailService();
