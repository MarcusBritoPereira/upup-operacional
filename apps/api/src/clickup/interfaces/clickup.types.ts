/**
 * Tipagem do subconjunto da API v2 do ClickUp que consumimos.
 * Referência: https://developer.clickup.com/reference
 */

export interface ClickUpUser {
  id: number;
  username: string | null;
  email: string;
  color?: string | null;
  profilePicture?: string | null;
  initials?: string | null;
  /** 1 = Owner, 2 = Admin, 3 = Member, 4 = Guest */
  role?: number;
  last_active?: string | null;
  date_joined?: string | null;
  date_invited?: string | null;
}

export interface ClickUpMember {
  user: ClickUpUser;
}

export interface ClickUpTeam {
  id: string;
  name: string;
  color?: string;
  avatar?: string | null;
  members: ClickUpMember[];
}

export interface ClickUpTeamsResponse {
  teams: ClickUpTeam[];
}

export interface ClickUpStatus {
  status: string;
  color?: string;
  /** 'open' | 'custom' | 'closed' | 'done' */
  type?: string;
  orderindex?: number;
}

export interface ClickUpPriority {
  id?: string;
  priority?: string;
  color?: string;
}

export interface ClickUpRef {
  id: string;
  name?: string;
}

export interface ClickUpTag {
  name: string;
}

export interface ClickUpTask {
  id: string;
  custom_id?: string | null;
  name: string;
  status?: ClickUpStatus;
  date_created?: string | null;
  date_updated?: string | null;
  date_closed?: string | null;
  due_date?: string | null;
  start_date?: string | null;
  creator?: ClickUpUser;
  assignees?: ClickUpUser[];
  priority?: ClickUpPriority | null;
  list?: ClickUpRef;
  folder?: ClickUpRef;
  space?: ClickUpRef;
  url?: string;
  tags?: ClickUpTag[];
}

export interface ClickUpFilteredTasksResponse {
  tasks: ClickUpTask[];
  last_page?: boolean;
}
