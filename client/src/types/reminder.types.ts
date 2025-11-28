// Reminder related types

export interface Reminder {
  id: number;
  applicationId: number;
  message: string;
  reminderDate: string; // ISO 8601 datetime
  sent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderRequest {
  message: string;
  reminderDate: string; // ISO 8601 datetime
}

export interface ReminderGrouped {
  today: Reminder[];
  tomorrow: Reminder[];
  thisWeek: Reminder[];
  later: Reminder[];
}
