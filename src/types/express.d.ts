declare global {
  namespace Express {
    interface Request {
      auth?: {
        tutorId: string;
      };
    }
  }
}

export {};
