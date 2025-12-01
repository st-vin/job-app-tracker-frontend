import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Trash2,
  Edit2,
  Plus,
  Clock,
  FileText,
  CalendarClock,
  CheckCircle2,
  AlarmClock,
  Phone,
  Code2,
  MessageSquare,
  MapPin,
  Award,
  Handshake,
  MoreHorizontal,
  Loader2,
} from "@/lib/lucide-icons";
import { format, formatDistanceToNow } from "date-fns";
import { applicationsApi, remindersApi, notesApi } from "../api/client";
import { Application, ApplicationStatus } from "../types/application.types";
import { Reminder } from "../types/reminder.types";
import { InterviewNote, InterviewStage } from "../types/note.types";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  PHONE_SCREEN: "bg-purple-100 text-purple-800",
  TECHNICAL: "bg-pink-100 text-pink-800",
  ONSITE: "bg-amber-100 text-amber-800",
  OFFER: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  INTERVIEW: "bg-cyan-100 text-cyan-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

const NOTE_STAGE_META: Record<
  InterviewStage,
  {
    label: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    badgeClass: string;
  }
> = {
  INITIAL_SCREENING: {
    label: "Initial Screening",
    description: "Recruiter intro or HR sync",
    icon: MessageSquare,
    badgeClass: "bg-slate-100 text-slate-700",
  },
  PHONE_SCREEN: {
    label: "Phone Screen",
    description: "High-level phone call",
    icon: Phone,
    badgeClass: "bg-blue-100 text-blue-700",
  },
  TECHNICAL_INTERVIEW: {
    label: "Technical Interview",
    description: "Coding / technical rounds",
    icon: Code2,
    badgeClass: "bg-purple-100 text-purple-700",
  },
  SYSTEM_DESIGN: {
    label: "System Design",
    description: "Architecture deep dives",
    icon: MapPin,
    badgeClass: "bg-orange-100 text-orange-700",
  },
  BEHAVIORAL: {
    label: "Behavioral",
    description: "Culture/values interviews",
    icon: MessageSquare,
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
  ONSITE: {
    label: "Onsite",
    description: "Full onsite loop",
    icon: CalendarClock,
    badgeClass: "bg-pink-100 text-pink-700",
  },
  FINAL_ROUND: {
    label: "Final Round",
    description: "Executive or final loop",
    icon: Award,
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  OFFER_DISCUSSION: {
    label: "Offer Discussion",
    description: "Negotiations / offer reviews",
    icon: Handshake,
    badgeClass: "bg-green-100 text-green-700",
  },
  OTHER: {
    label: "Other",
    description: "Custom conversations",
    icon: MoreHorizontal,
    badgeClass: "bg-gray-100 text-gray-700",
  },
};

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteStage, setNoteStage] = useState<InterviewStage>('PHONE_SCREEN');
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const appId = parseInt(id || "0");

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ["application", appId],
    queryFn: () => applicationsApi.getById(appId),
    enabled: !!appId,
  });

  const { data: reminders } = useQuery({
    queryKey: ["reminders", appId],
    queryFn: () => remindersApi.getByApplicationId(appId),
    enabled: !!appId,
  });

  const { data: notes } = useQuery({
    queryKey: ["notes", appId],
    queryFn: () => notesApi.getByApplicationId(appId),
    enabled: !!appId,
  });

  const sortedReminders = useMemo(() => {
    return [...(reminders || [])].sort(
      (a, b) =>
        new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime(),
    );
  }, [reminders]);

  const sortedNotes = useMemo(() => {
    return [...(notes || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notes]);

  const formatReminderInputValue = (value: string) =>
    value ? format(new Date(value), "yyyy-MM-dd'T'HH:mm") : "";

  const normalizeReminderDate = (value: string) =>
    value ? new Date(value).toISOString() : "";

  const resetReminderForm = () => {
    setReminderMessage("");
    setReminderDate("");
    setEditingReminder(null);
  };

  const openReminderDialog = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder);
      setReminderMessage(reminder.reminderMessage);
      setReminderDate(formatReminderInputValue(reminder.reminderDate));
    } else {
      resetReminderForm();
    }
    setShowReminderDialog(true);
  };

  const handleReminderDialogChange = (open: boolean) => {
    setShowReminderDialog(open);
    if (!open) {
      resetReminderForm();
    }
  };

  const describeReminder = (reminder: Reminder) => {
    const date = new Date(reminder.reminderDate);
    const isPast = date.getTime() < Date.now();
    const diffLabel = formatDistanceToNow(date, { addSuffix: true });
    let tone: "overdue" | "soon" | "upcoming" | "completed" = "upcoming";

    if (reminder.sent) {
      tone = "completed";
    } else if (isPast) {
      tone = "overdue";
    } else if (date.getTime() - Date.now() < 1000 * 60 * 60 * 24 * 2) {
      tone = "soon";
    }

    return { date, isPast, diffLabel, tone };
  };

  const createReminderMutation = useMutation({
    mutationFn: (data: { message: string; reminderDate: string }) =>
      remindersApi.create(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", appId] });
      resetReminderForm();
      setShowReminderDialog(false);
      toast.success("Reminder created");
    },
    onError: () => toast.error("Failed to create reminder"),
  });

  const updateReminderMutation = useMutation({
    mutationFn: ({
      reminderId,
      data,
    }: {
      reminderId: number;
      data: { message?: string; reminderDate?: string; sent?: boolean };
    }) => remindersApi.update(reminderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", appId] });
      resetReminderForm();
      setShowReminderDialog(false);
      toast.success("Reminder updated");
    },
    onError: () => toast.error("Failed to update reminder"),
  });

  const toggleReminderSentMutation = useMutation({
    mutationFn: (reminder: Reminder) =>
      remindersApi.update(reminder.id, { sent: !reminder.sent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", appId] });
    },
    onError: () => toast.error("Failed to update reminder"),
  });

  const handleReminderSubmit = () => {
    if (!reminderMessage || !reminderDate) {
      toast.error("Please complete the reminder form");
      return;
    }

    const payload = {
      reminderMessage,
      reminderDate: normalizeReminderDate(reminderDate),
    };

    if (editingReminder) {
      updateReminderMutation.mutate({ reminderId: editingReminder.id, data: payload });
    } else {
      createReminderMutation.mutate(payload);
    }
  };

  const deleteReminderMutation = useMutation({
    mutationFn: (reminderId: number) => remindersApi.delete(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders', appId] });
      toast.success('Reminder deleted');
    },
    onError: () => toast.error('Failed to delete reminder'),
  });

  const createNoteMutation = useMutation({
    mutationFn: () =>
      notesApi.create(appId, {
        content: noteContent,
        stage: noteStage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', appId] });
      setNoteContent('');
      setNoteStage('PHONE_SCREEN');
      setShowNoteDialog(false);
      toast.success('Note created');
    },
    onError: () => toast.error('Failed to create note'),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => notesApi.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', appId] });
      toast.success('Note deleted');
    },
    onError: () => toast.error('Failed to delete note'),
  });

  if (appLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found</p>
        <Button onClick={() => navigate('/applications')} className="mt-4">
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{application.companyName}</h1>
          <p className="text-muted-foreground">{application.position}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/applications/${appId}/edit`)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Delete Application</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this application? This action cannot be undone.
              </AlertDialogDescription>
              <div className="flex gap-3 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await applicationsApi.delete(appId);
                      toast.success('Application deleted');
                      navigate('/applications');
                    } catch {
                      toast.error('Failed to delete application');
                    }
                  }}
                  className="bg-destructive"
                >
                  Delete
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Overview Card */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge className={`mt-2 ${STATUS_COLORS[application.status]}`}>
              {application.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Applied Date</p>
            <p className="font-medium mt-2">
              {new Date(application.appliedDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Salary</p>
            <p className="font-medium mt-2">
              {application.salary ? `$${(application.salary / 1000).toFixed(0)}K` : 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Job Board</p>
            <p className="font-medium mt-2">{application.jobBoardSource || 'Not specified'}</p>
          </div>
        </div>

        {application.jobUrl && (
          <div className="mt-6 pt-6 border-t">
            <a
              href={application.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Job Posting →
            </a>
          </div>
        )}

        {application.notes && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">Notes</p>
            <p className="text-sm">{application.notes}</p>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Reminders ({reminders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes ({notes?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Application Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{new Date(application.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="ml-2">{new Date(application.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Stay on top of follow-ups with smart due labels.
              </p>
            </div>
            <Dialog open={showReminderDialog} onOpenChange={handleReminderDialogChange}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" onClick={() => openReminderDialog()}>
                  <Plus className="h-4 w-4" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingReminder ? "Edit Reminder" : "Create Reminder"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reminder-message">Message</Label>
                    <Textarea
                      id="reminder-message"
                      value={reminderMessage}
                      onChange={e => setReminderMessage(e.target.value)}
                      placeholder="e.g., Follow up with recruiter"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reminder-date">Date &amp; Time</Label>
                    <Input
                      id="reminder-date"
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      value={reminderDate}
                      onChange={e => setReminderDate(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleReminderSubmit}
                    disabled={
                      (createReminderMutation.isPending ||
                        updateReminderMutation.isPending) ||
                      !reminderMessage ||
                      !reminderDate
                    }
                    className="w-full gap-2"
                  >
                    {(createReminderMutation.isPending || updateReminderMutation.isPending) && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {editingReminder ? "Save Changes" : "Create Reminder"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sortedReminders.length > 0 ? (
            <div className="space-y-6">
              {sortedReminders.map(reminder => {
                const { date, diffLabel, tone } = describeReminder(reminder);
                return (
                  <div key={reminder.id} className="relative pl-10">
                    <div className="bg-border absolute left-4 top-0 h-full w-px" aria-hidden />
                    <span
                      className={cn(
                        "absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-background",
                        tone === "completed" && "border-muted-foreground text-muted-foreground",
                        tone === "overdue" && "border-destructive text-destructive",
                        tone === "soon" && "border-amber-500 text-amber-500",
                        tone === "upcoming" && "border-primary text-primary",
                      )}
                    >
                      {tone === "overdue" ? (
                        <AlarmClock className="h-3 w-3" />
                      ) : (
                        <CalendarClock className="h-3 w-3" />
                      )}
                    </span>
                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={cn(
                                "font-medium",
                                tone === "completed" && "bg-muted text-muted-foreground",
                                tone === "overdue" && "bg-destructive/15 text-destructive",
                                tone === "soon" && "bg-amber-500/15 text-amber-700",
                                tone === "upcoming" && "bg-primary/10 text-primary",
                              )}
                            >
                              {tone === "overdue"
                                ? "Overdue"
                                : tone === "soon"
                                  ? "Due soon"
                                  : tone === "completed"
                                    ? "Completed"
                                    : "Upcoming"}
                            </Badge>
                            {reminder.sent && (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Sent
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">{reminder.reminderMessage}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(date, "EEEE, MMM d • h:mma")} &middot; {diffLabel}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleReminderSentMutation.mutate(reminder)}
                            title={reminder.sent ? "Mark as pending" : "Mark as complete"}
                          >
                            <CheckCircle2
                              className={cn(
                                "h-4 w-4",
                                reminder.sent
                                  ? "text-muted-foreground"
                                  : "text-emerald-600",
                              )}
                            />
                            <span className="sr-only">Toggle reminder status</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openReminderDialog(reminder)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Edit reminder</span>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteReminderMutation.mutate(reminder.id)}
                            disabled={deleteReminderMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete reminder</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No reminders yet. Create your first reminder to stay on track.
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
            <h3 className="font-semibold">Interview Notes</h3>
              <p className="text-sm text-muted-foreground">
                Capture insights from every stage in a single timeline.
              </p>
            </div>
            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Interview Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="note-stage">Interview Stage</Label>
                    <Select
                      value={noteStage}
                      onValueChange={value => setNoteStage(value as InterviewStage)}
                    >
                      <SelectTrigger id="note-stage">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(NOTE_STAGE_META).map(([key, meta]) => (
                          <SelectItem key={key} value={key}>
                            {meta.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="note-content">Notes</Label>
                    <Textarea
                      id="note-content"
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      placeholder="What happened during this interview?"
                      rows={5}
                    />
                  </div>
                  <Button
                    onClick={() => createNoteMutation.mutate()}
                    disabled={createNoteMutation.isPending || !noteContent}
                    className="w-full"
                  >
                    Save Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {sortedNotes.length > 0 ? (
            <div className="space-y-6">
              {sortedNotes.map(note => {
                const meta = NOTE_STAGE_META[note.stage];
                const StageIcon = meta.icon;
                return (
                  <div key={note.id} className="relative pl-10">
                    <div
                      className="bg-border absolute left-4 top-0 h-full w-px"
                      aria-hidden
                    />
                    <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-muted-foreground/40 bg-background text-muted-foreground">
                      <StageIcon className="h-3 w-3" />
                    </span>
                    <Card className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div>
                            <Badge
                              className={cn("mb-1", meta.badgeClass)}
                            >
                              {meta.label}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {meta.description}
                            </p>
                          </div>
                          <p className="text-sm leading-relaxed">{note.content}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })} •{" "}
                            {format(new Date(note.createdAt), "MMM d, yyyy h:mma")}
                      </p>
                    </div>
                    <Button
                          size="icon"
                      variant="ghost"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                      disabled={deleteNoteMutation.isPending}
                    >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete note</span>
                    </Button>
                  </div>
                </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              No interview notes yet. Document takeaways after each conversation.
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

