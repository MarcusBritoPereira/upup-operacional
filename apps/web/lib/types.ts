export type UserRole =
  | 'admin'
  | 'diretoria'
  | 'gerencia'
  | 'gestor_cliente'
  | 'producao';

export type ClientStatus = 'active' | 'paused' | 'inactive' | 'cancelled' | 'churned';
export type HealthStatus = 'green' | 'yellow' | 'red' | 'gray';
export type ActionPlanStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Client {
  id: string;
  tradeName: string;
  legalName?: string;
  segment?: string;
  status: ClientStatus;
  entryDate: string;
  exitDate?: string;
  exitReason?: string;
  monthlyContractValue: number;
  managerId?: string;
  decisionMakerName?: string;
  decisionMakerPhone?: string;
  decisionMakerEmail?: string;
  city?: string;
  state?: string;
  instagramUrl?: string;
  driveUrl?: string;
  clickupUrl?: string;
  whatsappGroupUrl?: string;
  clientProfile?: string;
  marketingMaturity?: string;
  strategicNotes?: string;
  healthStatus?: HealthStatus;
  healthScore?: number;
}

export interface Squad {
  id: string;
  name: string;
  leaderId?: string;
  status: string;
}

export interface ActionPlan {
  id: string;
  clientId: string;
  problem: string;
  probableCause?: string;
  action: string;
  responsibleId?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: ActionPlanStatus;
  result?: string;
  learning?: string;
  canBecomePlaybook: boolean;
  responsible?: {
    id: string;
    name: string;
    email: string;
  };
  creator?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    tradeName: string;
  };
}

export interface Alert {
  id: string;
  clientId: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description?: string;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  client?: {
    id: string;
    tradeName: string;
  };
}

export interface ClientTimeline {
  id: string;
  clientId: string;
  eventType: string;
  title: string;
  description?: string;
  createdById?: string;
  createdAt: string;
  creator?: {
    id: string;
    name: string;
  };
}

export interface WeeklyFollowup {
  id: string;
  clientId: string;
  monthlyCycleId: string;
  managerId: string;
  weekStart: string;
  weekEnd: string;
  groupActivated?: string;
  clientResponded?: string;
  agencyRespondedOnTime?: string;
  calendarOnTrack?: string;
  hasDelayedDelivery: boolean;
  clientShowedDissatisfaction: boolean;
  churnRisk?: string;
  weeklyScore: number;
  managerNotes?: string;
  recommendedAction?: string;
  contentGeneratedQuantity?: number;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface DashboardOverview {
  totalActiveClients: number;
  clientsInOnboarding: number;
  clientsAtRisk: number;
  clientsHealthy: number;
  clientsWithoutFollowup: number;
  overdueActionPlans: number;
  totalPortfolioValue: number;
  churnThisMonth: number;
}

export interface Contract {
  id: string;
  clientId: string;
  startDate: string;
  endDate?: string;
  monthlyValue: number;
  taxPercentage?: number;
  geePercentage?: number;
  geeFixedValue?: number;
  documentUrl?: string;
  status: string;
  notes?: string;
  createdAt: string;
  deliverables?: ContractDeliverable[];
}

export interface ContractDeliverable {
  id: string;
  contractId: string;
  deliverableTypeId: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliverableType?: DeliverableType;
}

export interface DeliverableType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface MonthlyDeliverable {
  id: string;
  monthlyCycleId: string;
  deliverableTypeId: string;
  contractedQuantity: number;
  deliveredQuantity: number;
  inProgressQuantity: number;
  delayedQuantity: number;
  status: string;
  notes?: string;
  deliverableType: DeliverableType;
}

export interface MonthlyCycle {
  id: string;
  clientId: string;
  month: number;
  year: number;
  managerId?: string;
  status: string;
  healthScore?: number;
  healthStatus: HealthStatus;
  closingNotes?: string;
  monthlyDeliverables: MonthlyDeliverable[];
}
