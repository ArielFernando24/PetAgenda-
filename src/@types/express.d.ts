export interface AuthUserPayload {
  tutor_id: string;
  email?: string;
  token_version?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
