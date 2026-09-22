import { Response } from 'express';

export interface SseClient {
  id: string;
  userId: string;
  res: Response;
}

export class NotificationStreamManager {
  // Mapeia userId -> Map de conexões ativas (clientId -> Response)
  private clientsByUser: Map<string, Map<string, Response>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Inicia heartbeat a cada 25 segundos para manter conexões abertas
    this.startHeartbeat();
  }

  /**
   * Adiciona uma nova conexão SSE para o usuário especificado.
   * Retorna uma função de cancelamento/cleanup.
   */
  public addClient(userId: string, res: Response): () => void {
    const clientId = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Configura cabeçalhos padrão de Server-Sent Events (SSE)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    // Envia evento inicial de conexão estabelecida
    this.writeEvent(res, 'connected', {
      clientId,
      userId,
      timestamp: new Date().toISOString(),
      message: 'Conectado à Central de Notificações em Tempo Real',
    });

    if (!this.clientsByUser.has(userId)) {
      this.clientsByUser.set(userId, new Map());
    }

    const userClients = this.clientsByUser.get(userId)!;
    userClients.set(clientId, res);

    // Função de limpeza ao desconectar
    const cleanup = () => {
      if (this.clientsByUser.has(userId)) {
        const clients = this.clientsByUser.get(userId)!;
        clients.delete(clientId);
        if (clients.size === 0) {
          this.clientsByUser.delete(userId);
        }
      }
    };

    return cleanup;
  }

  /**
   * Envia evento direcionado para todos os dispositivos/abas conectados do usuário.
   */
  public sendToUser(userId: string, eventName: string, data: unknown): boolean {
    const userClients = this.clientsByUser.get(userId);
    if (!userClients || userClients.size === 0) {
      return false; // Usuário offline no momento
    }

    const deadClientIds: string[] = [];

    for (const [clientId, res] of userClients.entries()) {
      try {
        this.writeEvent(res, eventName, data);
      } catch (err) {
        deadClientIds.push(clientId);
      }
    }

    // Limpa conexões que falharam
    for (const deadId of deadClientIds) {
      userClients.delete(deadId);
    }

    if (userClients.size === 0) {
      this.clientsByUser.delete(userId);
    }

    return true;
  }

  /**
   * Transmite evento para todos os clientes conectados (broadcast geral).
   */
  public broadcast(eventName: string, data: unknown): void {
    for (const userId of this.clientsByUser.keys()) {
      this.sendToUser(userId, eventName, data);
    }
  }

  /**
   * Retorna a quantidade de conexões ativas no momento (global ou por usuário).
   */
  public getActiveConnectionsCount(userId?: string): number {
    if (userId) {
      return this.clientsByUser.get(userId)?.size ?? 0;
    }

    let total = 0;
    for (const clients of this.clientsByUser.values()) {
      total += clients.size;
    }
    return total;
  }

  /**
   * Formata e escreve o frame SSE na resposta.
   */
  private writeEvent(res: Response, eventName: string, data: unknown): void {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    res.write(`event: ${eventName}\ndata: ${payload}\n\n`);
  }

  /**
   * Heartbeat para manter streams ativas e evitar timeouts de proxies reversos.
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(() => {
      for (const [userId, userClients] of this.clientsByUser.entries()) {
        const deadClientIds: string[] = [];
        for (const [clientId, res] of userClients.entries()) {
          try {
            res.write(`:keepalive ${Date.now()}\n\n`);
          } catch {
            deadClientIds.push(clientId);
          }
        }
        for (const deadId of deadClientIds) {
          userClients.delete(deadId);
        }
        if (userClients.size === 0) {
          this.clientsByUser.delete(userId);
        }
      }
    }, 25000);

    // Evita impedir o encerramento do processo Node em testes
    if (this.heartbeatInterval.unref) {
      this.heartbeatInterval.unref();
    }
  }

  /**
   * Encerra o heartbeat e fecha conexões (para teardown de testes).
   */
  public destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.clientsByUser.clear();
  }
}

export const notificationStreamManager = new NotificationStreamManager();
