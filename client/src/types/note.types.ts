// Interview note related types

export type InterviewStage =
  | 'INITIAL_SCREENING'
  | 'PHONE_SCREEN'
  | 'TECHNICAL_INTERVIEW'
  | 'SYSTEM_DESIGN'
  | 'BEHAVIORAL'
  | 'ONSITE'
  | 'FINAL_ROUND'
  | 'OFFER_DISCUSSION'
  | 'OTHER';

export interface InterviewNote {
  id: number;
  applicationId: number;
  stage: InterviewStage;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  stage: InterviewStage;
  content: string;
}
