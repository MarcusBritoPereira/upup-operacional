import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClickUpApiClient } from './clickup-api.client';
import {
  ClickUpTask,
  ClickUpTeam,
  ClickUpUser,
} from './interfaces/clickup.types';

const CLICKUP_ROLE_LABELS: Record<number, string> = {
  1: 'Owner',
  2: 'Admin',
  3: 'Member',
  4: 'Guest',
};

/** Trava de segurança: 50 páginas * 100 = até 5.000 tasks por chamada. */
const MAX_TASK_PAGES = 50;
const TASKS_PER_PAGE = 100;

export interface NormalizedMember {
  clickupUserId: number;
  username: string | null;
  email: string;
  role: string;
  roleCode: number | null;
  profilePicture: string | null;
  lastActive: string | null;
}

export interface NormalizedTaskAssignee {
  id: number;
  username: string | null;
  email: string;
}

export interface NormalizedTask {
  id: string;
  customId: string | null;
  name: string;
  status: string | null;
  statusType: string | null;
  priority: string | null;
  assignees: NormalizedTaskAssignee[];
  list: string | null;
  folder: string | null;
  space: string | null;
  dueDate: string | null;
  startDate: string | null;
  dateCreated: string | null;
  dateUpdated: string | null;
  url: string | null;
  tags: string[];
}

@Injectable()
export class ClickUpService {
  constructor(
    private readonly client: ClickUpApiClient,
    private readonly configService: ConfigService,
  ) {}

  isConfigured(): boolean {
    return this.client.isConfigured();
  }

  async getWorkspaces(): Promise<
    { id: string; name: string; memberCount: number }[]
  > {
    const { teams } = await this.client.getTeams();
    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      memberCount: team.members?.length ?? 0,
    }));
  }

  async listMembers(): Promise<NormalizedMember[]> {
    const team = await this.resolveTeam();
    return (team.members ?? [])
      .map((member) => this.normalizeMember(member.user))
      .sort((a, b) =>
        (a.username ?? a.email).localeCompare(b.username ?? b.email, 'pt-BR'),
      );
  }

  async listAllTasks(filters: {
    includeClosed?: boolean;
    assignees?: string[];
    statuses?: string[];
  }): Promise<{
    teamId: string;
    total: number;
    truncated: boolean;
    tasks: NormalizedTask[];
  }> {
    const team = await this.resolveTeam();
    const tasks: NormalizedTask[] = [];
    let truncated = false;

    for (let page = 0; page < MAX_TASK_PAGES; page++) {
      const response = await this.client.getFilteredTeamTasks(team.id, {
        page,
        includeClosed: filters.includeClosed,
        assignees: filters.assignees,
        statuses: filters.statuses,
      });

      const batch = response.tasks ?? [];
      for (const task of batch) {
        tasks.push(this.normalizeTask(task));
      }

      const isLastPage =
        response.last_page === true || batch.length < TASKS_PER_PAGE;
      if (isLastPage) break;

      if (page === MAX_TASK_PAGES - 1) {
        truncated = true;
      }
    }

    return { teamId: team.id, total: tasks.length, truncated, tasks };
  }

  private async resolveTeam(): Promise<ClickUpTeam> {
    const configuredTeamId = this.configService.get<string>('CLICKUP_TEAM_ID');
    const { teams } = await this.client.getTeams();

    if (!teams || teams.length === 0) {
      throw new ServiceUnavailableException(
        'Nenhum workspace do ClickUp acessível com este token.',
      );
    }

    if (configuredTeamId) {
      const match = teams.find((team) => team.id === configuredTeamId);
      if (match) return match;
    }

    // Fallback: tenta pegar o primeiro workspace que realmente tenha membros
    const teamWithMembers = teams.find((t) => t.members && t.members.length > 0);
    return teamWithMembers || teams[0];
  }

  private normalizeMember(user: ClickUpUser): NormalizedMember {
    return {
      clickupUserId: user.id,
      username: user.username ?? null,
      email: user.email,
      role:
        user.role && CLICKUP_ROLE_LABELS[user.role]
          ? CLICKUP_ROLE_LABELS[user.role]
          : 'Member',
      roleCode: user.role ?? null,
      profilePicture: user.profilePicture ?? null,
      lastActive: user.last_active ?? null,
    };
  }

  private normalizeTask(task: ClickUpTask): NormalizedTask {
    return {
      id: task.id,
      customId: task.custom_id ?? null,
      name: task.name,
      status: task.status?.status ?? null,
      statusType: task.status?.type ?? null,
      priority: task.priority?.priority ?? null,
      assignees: (task.assignees ?? []).map((assignee) => ({
        id: assignee.id,
        username: assignee.username ?? null,
        email: assignee.email,
      })),
      list: task.list?.name ?? null,
      folder: task.folder?.name ?? null,
      space: task.space?.name ?? null,
      dueDate: task.due_date ?? null,
      startDate: task.start_date ?? null,
      dateCreated: task.date_created ?? null,
      dateUpdated: task.date_updated ?? null,
      url: task.url ?? null,
      tags: (task.tags ?? []).map((tag) => tag.name),
    };
  }
}
