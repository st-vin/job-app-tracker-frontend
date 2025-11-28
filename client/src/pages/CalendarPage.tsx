import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { remindersApi, applicationsApi } from "@/api/client";
import { Reminder } from "@/types/reminder.types";
import { Application, ApplicationStatus } from "@/types/application.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "reminder" | "application";

type CalendarEvent = {
  id: string;
  type: EventType;
  label: string;
  secondaryLabel: string;
  status?: ApplicationStatus;
  sent?: boolean;
  applicationId?: number;
  reminderId?: number;
  date: string;
};

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  APPLIED: "bg-blue-100 text-blue-800 border-blue-200",
  PHONE_SCREEN: "bg-purple-100 text-purple-800 border-purple-200",
  TECHNICAL: "bg-pink-100 text-pink-800 border-pink-200",
  INTERVIEW: "bg-cyan-100 text-cyan-800 border-cyan-200",
  ONSITE: "bg-amber-100 text-amber-800 border-amber-200",
  OFFER: "bg-green-100 text-green-800 border-green-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  WITHDRAWN: "bg-slate-100 text-slate-700 border-slate-200",
};

const REMINDER_STYLES = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatStatusLabel = (status: string) =>
  status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const {
    data: reminders,
    isLoading: remindersLoading,
    isError: remindersError,
  } = useQuery({
    queryKey: ["calendar-reminders"],
    queryFn: remindersApi.getAll,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: applications,
    isLoading: applicationsLoading,
    isError: applicationsError,
  } = useQuery({
    queryKey: ["applications"],
    queryFn: applicationsApi.getAll,
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = remindersLoading || applicationsLoading;
  const hasError = remindersError || applicationsError;

  const monthMatrix = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    const weeks: Date[][] = [];
    let cursor = start;

    while (cursor <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i += 1) {
        week.push(addDays(cursor, i));
      }
      weeks.push(week);
      cursor = addDays(cursor, 7);
    }

    return weeks;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    const pushEvent = (dateKey: string, event: CalendarEvent) => {
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(event);
    };

    (reminders ?? []).forEach(reminder => {
      const reminderDate = format(new Date(reminder.reminderDate), "yyyy-MM-dd");
      const label = reminder.reminderMessage;
      const secondary = reminder.application
        ? `${reminder.application.companyName} · ${reminder.application.position}`
        : "Reminder";

      pushEvent(reminderDate, {
        id: `reminder-${reminder.id}`,
        type: "reminder",
        label,
        secondaryLabel: secondary,
        sent: reminder.sent,
        applicationId: reminder.applicationId,
        reminderId: reminder.id,
        date: reminderDate,
      });
    });

    (applications ?? []).forEach(application => {
      const appliedDate = format(new Date(application.appliedDate), "yyyy-MM-dd");
      pushEvent(appliedDate, {
        id: `application-${application.id}`,
        type: "application",
        label: `${application.companyName}`,
        secondaryLabel: `${application.position}`,
        applicationId: application.id,
        status: application.status,
        date: appliedDate,
      });
    });

    return map;
  }, [reminders, applications]);

  const getEventsForDay = (day: Date) =>
    eventsByDate[format(day, "yyyy-MM-dd")]?.sort((a, b) => a.type.localeCompare(b.type)) ?? [];

  const handlePrevMonth = () => setCurrentMonth(prev => startOfMonth(addDays(prev, -1)));
  const handleNextMonth = () => setCurrentMonth(prev => startOfMonth(addDays(endOfMonth(prev), 1)));
  const handleToday = () => setCurrentMonth(startOfMonth(new Date()));

  const renderEvent = (event: CalendarEvent) => {
    const isReminder = event.type === "reminder";
    const classes = isReminder
      ? event.sent
        ? REMINDER_STYLES.completed
        : REMINDER_STYLES.pending
      : STATUS_STYLES[event.status ?? "APPLIED"];

    const handleClick = () => {
      if (event.applicationId) {
        navigate(`/applications/${event.applicationId}`);
      } else if (isReminder) {
        navigate("/reminders");
      }
    };

    return (
      <button
        key={event.id}
        onClick={handleClick}
        className={cn(
          "w-full rounded-md border px-2 py-1 text-left text-xs transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          classes,
        )}
      >
        <p className="font-semibold leading-tight line-clamp-1">{event.label}</p>
        <p className="text-[10px] leading-tight opacity-80 line-clamp-1">{event.secondaryLabel}</p>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Visualize all applications and reminder touchpoints in one monthly view.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button onClick={() => navigate("/reminders")} variant="default" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Manage Reminders
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Button size="icon" variant="ghost" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>{format(currentMonth, "MMMM yyyy")}</span>
            <Button size="icon" variant="ghost" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className={REMINDER_STYLES.pending}>
              Pending reminder
            </Badge>
            <Badge variant="outline" className={REMINDER_STYLES.completed}>
              Completed reminder
            </Badge>
            {Object.entries(STATUS_STYLES).map(([status, style]) => (
              <Badge key={status} variant="outline" className={style}>
                {formatStatusLabel(status)}
              </Badge>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm font-semibold">Unable to load calendar data</p>
            <p className="text-xs text-muted-foreground">
              Please refresh the page or try again later.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-7 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {weekdayLabels.map(day => (
                <div key={day} className="px-2 py-1">
                  {day}
                </div>
              ))}
            </div>
            {monthMatrix.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map(day => {
                  const events = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "flex min-h-[140px] flex-col gap-1 rounded-md border bg-background p-2",
                        !isCurrentMonth && "bg-muted/40 text-muted-foreground",
                        isToday(day) && "border-primary shadow-sm",
                      )}
                    >
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className={cn(isToday(day) && "text-primary")}>
                          {format(day, "d")}
                        </span>
                        {!!events.length && (
                          <span className="text-[10px] text-muted-foreground">
                            {events.length} {events.length === 1 ? "item" : "items"}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        {events.length ? events.slice(0, 3).map(renderEvent) : (
                          <p className="text-[11px] text-muted-foreground/70">
                            No activity
                          </p>
                        )}
                        {events.length > 3 && (
                          <p className="text-[11px] font-medium text-muted-foreground">
                            +{events.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


