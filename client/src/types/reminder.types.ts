import type { Application } from "./application.types";

// Reminder related types

export interface Reminder {
  id: number;
  applicationId: number;
  message: string;
  reminderDate: string; // ISO 8601 datetime
  sent: boolean;
  createdAt: string;
  updatedAt: string;
  application?: Application;
}

export interface CreateReminderRequest {
  message: string;
  reminderDate: string; // ISO 8601 datetime
}

export interface UpdateReminderRequest {
  message?: string;
  reminderDate?: string;
  sent?: boolean;
}

export interface ReminderGrouped {
  today: Reminder[];
  tomorrow: Reminder[];
  thisWeek: Reminder[];
  later: Reminder[];
}
