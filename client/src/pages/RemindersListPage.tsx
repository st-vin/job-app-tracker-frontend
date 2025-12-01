import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, isAfter, isToday, isTomorrow } from "date-fns";
import { remindersApi, applicationsApi } from "@/api/client";
import { Reminder } from "@/types/reminder.types";
import { Application } from "@/types/application.types";
import {
  AlarmClock,
  CheckCircle2,
  Edit2,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "@/lib/lucide-icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";

type StatusFilter = "all" | "open" | "sent";

const formatInputValue = (iso: string) =>
  iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : "";

const normalizeDateValue = (value: string) =>
  value ? new Date(value).toISOString() : "";

export default function RemindersListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState("");

  const { data: reminders, isLoading } = useQuery({
    queryKey: ["reminders-all"],
    queryFn: remindersApi.getAll,
  });

  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: applicationsApi.getAll,
  });

  const resetForm = () => {
    setEditingReminder(null);
    setSelectedApplicationId("");
    setMessage("");
    setDateTime("");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setSelectedApplicationId(reminder.applicationId.toString());
    setMessage(reminder.reminderMessage);
    setDateTime(formatInputValue(reminder.reminderDate));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const createMutation = useMutation({
    mutationFn: () =>
      remindersApi.create(Number(selectedApplicationId), {
        reminderMessage: message,
        reminderDate: normalizeDateValue(dateTime),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders-all"] });
      toast.success("Reminder created");
      closeDialog();
    },
    onError: () => toast.error("Failed to create reminder"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      remindersApi.update(editingReminder!.id, {
        reminderMessage: message,
        reminderDate: normalizeDateValue(dateTime),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders-all"] });
      toast.success("Reminder updated");
      closeDialog();
    },
    onError: () => toast.error("Failed to update reminder"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => remindersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders-all"] });
      toast.success("Reminder deleted");
    },
    onError: () => toast.error("Failed to delete reminder"),
  });

  const markCompleteMutation = useMutation({
    mutationFn: (reminder: Reminder) =>
      remindersApi.update(reminder.id, {
        sent: !reminder.sent,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders-all"] });
    },
    onError: () => toast.error("Failed to update reminder"),
  });

  const resolvedReminders = reminders || [];

  const filteredReminders = useMemo(() => {
    return resolvedReminders.filter(reminder => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "open" && !reminder.sent) ||
        (statusFilter === "sent" && reminder.sent);

      const application = reminder.application
        ? reminder.application.companyName
        : applications?.find(app => app.id === reminder.applicationId)?.companyName;

      const haystack = `${reminder.reminderMessage} ${application ?? ""}`.toLowerCase();
      const matchesSearch = haystack.includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [resolvedReminders, statusFilter, searchQuery, applications]);

  const groupedReminders = useMemo(() => {
    const now = new Date();
    return {
      overdue: filteredReminders.filter(
        reminder => !reminder.sent && new Date(reminder.reminderDate).getTime() < now.getTime(),
      ),
      today: filteredReminders.filter(reminder => isToday(new Date(reminder.reminderDate))),
      tomorrow: filteredReminders.filter(reminder => isTomorrow(new Date(reminder.reminderDate))),
      upcoming: filteredReminders.filter(reminder => {
        const date = new Date(reminder.reminderDate);
        return !isToday(date) && !isTomorrow(date) && isAfter(date, now);
      }),
    };
  }, [filteredReminders]);

  const hasData =
    groupedReminders.overdue.length ||
    groupedReminders.today.length ||
    groupedReminders.tomorrow.length ||
    groupedReminders.upcoming.length;

  const handleSubmit = () => {
    if (!message || !dateTime || (!editingReminder && !selectedApplicationId)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingReminder) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const renderReminderCard = (reminder: Reminder) => {
    const application =
      reminder.application ||
      applications?.find(app => app.id === reminder.applicationId);

    return (
      <Card key={reminder.id} className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={reminder.sent ? "outline" : "secondary"}>
                {reminder.sent ? "Completed" : "Pending"}
              </Badge>
              {application && (
                <button
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => navigate(`/applications/${application.id}`)}
                >
                  {application.companyName} · {application.position}
                </button>
              )}
            </div>
            <p className="text-base font-semibold">{reminder.reminderMessage}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(reminder.reminderDate), "EEEE, MMM d • h:mma")} ·{" "}
              {formatDistanceToNow(new Date(reminder.reminderDate), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => markCompleteMutation.mutate(reminder)}
              title={reminder.sent ? "Mark as pending" : "Mark as complete"}
            >
              <CheckCircle2 className={`h-4 w-4 ${reminder.sent ? "text-muted-foreground" : "text-emerald-600"}`} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => openEditDialog(reminder)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteMutation.mutate(reminder.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground">
            Keep track of every follow-up across all applications.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          New Reminder
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by company or reminder..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            {(["all", "open", "sent"] as StatusFilter[]).map(filter => (
              <Button
                key={filter}
                variant={statusFilter === filter ? "default" : "ghost"}
                size="sm"
                onClick={() => setStatusFilter(filter)}
              >
                {filter === "all" ? "All" : filter === "open" ? "Open" : "Sent"}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : hasData ? (
        <div className="space-y-8">
          {(["overdue", "today", "tomorrow", "upcoming"] as const).map(section => {
            const data = groupedReminders[section];
            if (!data.length) return null;

            const titleMap: Record<typeof section, string> = {
              overdue: "Overdue",
              today: "Today",
              tomorrow: "Tomorrow",
              upcoming: "Upcoming",
            };

            return (
              <div key={section} className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlarmClock className="h-4 w-4 text-primary" />
                  <h2 className="text-xl font-semibold">{titleMap[section]}</h2>
                  <span className="text-sm text-muted-foreground">{data.length} reminder(s)</span>
                </div>
                <div className="space-y-3">{data.map(renderReminderCard)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <AlarmClock className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No reminders found</h3>
          <p className="text-sm text-muted-foreground">
            Create your first reminder to stay on top of follow-ups.
          </p>
          <Button className="mt-4" onClick={openCreateDialog}>
            Create Reminder
          </Button>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={open => (open ? setIsDialogOpen(true) : closeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReminder ? "Edit Reminder" : "New Reminder"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingReminder && (
              <div>
                <Label htmlFor="reminder-application">Application</Label>
                <Select
                  value={selectedApplicationId}
                  onValueChange={setSelectedApplicationId}
                >
                  <SelectTrigger id="reminder-application" className="mt-2">
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications?.map(app => (
                      <SelectItem key={app.id} value={String(app.id)}>
                        {app.companyName} · {app.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="reminder-message">Message</Label>
              <Textarea
                id="reminder-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="e.g., Follow up with recruiter"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="reminder-date">Date &amp; Time</Label>
              <Input
                id="reminder-date"
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                value={dateTime}
                onChange={e => setDateTime(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                (!editingReminder && createMutation.isPending)
              }
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editingReminder ? "Save Changes" : "Create Reminder"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


