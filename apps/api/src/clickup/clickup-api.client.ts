import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClickUpFilteredTasksResponse,
  ClickUpTeamsResponse,
} from './interfaces/clickup.types';

const CLICKUP_BASE_URL = 'https://api.clickup.com/api/v2';
const MAX_RATE_LIMIT_RETRIES = 3;

type QueryValue = string | number | boolean | string[] | undefined;

/**
 * Cliente HTTP fino para a API v2 do ClickUp.
 * Usa o fetch nativo (Node >= 20) — sem dependências externas.
 * O token pessoal (pk_...) vai cru no header Authorization, sem prefixo "Bearer".
 */
@Injectable()
export class ClickUpApiClient {
  private readonly logger = new Logger(ClickUpApiClient.name);

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.getToken());
  }

  private getToken(): string | undefined {
    const token = this.configService.get<string>('CLICKUP_API_TOKEN');
    return token && token.trim() ? token.trim() : undefined;
  }

  private buildUrl(path: string, query?: Record<string, QueryValue>): URL {
    const url = new URL(`${CLICKUP_BASE_URL}${path}`);
    if (!query) return url;

    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(`${key}[]`, String(item));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
    return url;
  }

  private async request<T>(
    path: string,
    query?: Record<string, QueryValue>,
  ): Promise<T> {
    const token = this.getToken();
    if (!token) {
      throw new ServiceUnavailableException(
        'Integração com o ClickUp não configurada. Defina CLICKUP_API_TOKEN no ambiente.',
      );
    }

    const url = this.buildUrl(path, query);

    for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt++) {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 429) {
        if (attempt < MAX_RATE_LIMIT_RETRIES) {
          const retryAfter = Number(response.headers.get('retry-after') ?? '1');
          const waitMs = Math.max(retryAfter, 1) * 1000;
          this.logger.warn(
            `Rate limit do ClickUp atingido. Aguardando ${waitMs}ms (tentativa ${attempt + 1}).`,
          );
          await delay(waitMs);
          continue;
        }
        throw new ServiceUnavailableException(
          'Limite de requisições do ClickUp excedido. Tente novamente em instantes.',
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new UnauthorizedException(
          'Token do ClickUp inválido ou sem permissão para este recurso.',
        );
      }

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        this.logger.error(`Erro ClickUp ${response.status}: ${body}`);
        throw new BadGatewayException(
          `Falha ao consultar o ClickUp (HTTP ${response.status}).`,
        );
      }

      return (await response.json()) as T;
    }

    throw new ServiceUnavailableException('Falha ao consultar o ClickUp.');
  }

  /** GET /team — workspaces autorizados (cada um já traz seus membros). */
  getTeams(): Promise<ClickUpTeamsResponse> {
    return this.request<ClickUpTeamsResponse>('/team');
  }

  /** GET /team/{team_id}/task — tasks do workspace, 100 por página. */
  getFilteredTeamTasks(
    teamId: string,
    params: {
      page?: number;
      includeClosed?: boolean;
      assignees?: string[];
      statuses?: string[];
      subtasks?: boolean;
      orderBy?: string;
      reverse?: boolean;
    } = {},
  ): Promise<ClickUpFilteredTasksResponse> {
    return this.request<ClickUpFilteredTasksResponse>(`/team/${teamId}/task`, {
      page: params.page ?? 0,
      include_closed: params.includeClosed ?? false,
      subtasks: params.subtasks ?? true,
      order_by: params.orderBy ?? 'updated',
      reverse: params.reverse ?? true,
      assignees: params.assignees,
      statuses: params.statuses,
    });
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
