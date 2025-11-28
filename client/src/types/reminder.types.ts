import type { Application } from "./application.types";

// Reminder related types

export interface Reminder {
  id: number;
  applicationId: number;
  reminderMessage: string;
  reminderDate: string; // ISO 8601 datetime
  sent: boolean;
  createdAt: string;
  updatedAt: string;
  application?: Application;
}

export interface CreateReminderRequest {
  reminderMessage: string;
  reminderDate: string; // ISO 8601 datetime
}

export interface UpdateReminderRequest {
  reminderMessage?: string;
  reminderDate?: string;
  sent?: boolean;
}

export interface ReminderGrouped {
  today: Reminder[];
  tomorrow: Reminder[];
  thisWeek: Reminder[];
  later: Reminder[];
}
