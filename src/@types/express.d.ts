export interface AuthUserPayload {
  tutor_id: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
