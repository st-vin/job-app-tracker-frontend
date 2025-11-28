// Application related types

export type ApplicationStatus =
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'TECHNICAL'
  | 'ONSITE'
  | 'OFFER'
  | 'REJECTED'
  | 'INTERVIEW'
  | 'WITHDRAWN';

export interface Application {
  id: number;
  companyName: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: string; // ISO 8601 date
  salary?: number;
  jobBoardSource?: string;
  jobUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  reminderCount?: number;
  interviewNoteCount?: number;
  statusHistoryCount?: number;
}

export interface CreateApplicationRequest {
  companyName: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: string;
  salary?: number;
  jobBoardSource?: string;
  jobUrl?: string;
  notes?: string;
}

export interface UpdateApplicationRequest {
  companyName?: string;
  position?: string;
  status?: ApplicationStatus;
  appliedDate?: string;
  salary?: number;
  jobBoardSource?: string;
  jobUrl?: string;
  notes?: string;
}

export interface UpdateApplicationStatusRequest {
  status: ApplicationStatus;
}

export interface DashboardStats {
  totalApplications: number;
  byStatus: {
    APPLIED: number;
    PHONE_SCREEN: number;
    TECHNICAL: number;
    ONSITE: number;
    OFFER: number;
    REJECTED: number;
    INTERVIEW: number;
    WITHDRAWN: number;
  };
  averageSalary: number;
  last30DaysSubmissions: number;
}

export interface PaginatedApplications {
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  content: Application[];
  empty: boolean;
}

export interface ApplicationSearchResult {
  results: Application[];
  total: number;
}

export interface ApplicationFilterParams {
  status?: ApplicationStatus[];
  minSalary?: number;
  maxSalary?: number;
  keyword?: string;
}
