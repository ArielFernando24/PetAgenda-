import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number; // Janela de tempo em ms
  max: number;      // Máximo de requisições na janela
  message?: string;
  keyGenerator?: (req: Request) => string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Muitas requisições. Por favor, tente novamente mais tarde.',
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || 'unknown-client',
  } = options;

  const hits = new Map<string, ClientRecord>();

  const limiter = (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();

    const record = hits.get(key);

    if (!record || now > record.resetTime) {
      hits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        status: 'error',
        code: 'TOO_MANY_REQUESTS',
        message,
      });
      return;
    }

    record.count += 1;
    next();
  };

  limiter.reset = () => {
    hits.clear();
  };

  return limiter;
}

// 5 requisições a cada 15 minutos para recuperação e redefinição de senha
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de recuperação de senha. Tente novamente em 15 minutos.',
});
