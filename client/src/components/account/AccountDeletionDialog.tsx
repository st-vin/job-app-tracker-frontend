import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usersApi } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface AccountDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DeletionStep = 1 | 2 | 3;

const STEP_CONTENT: Record<
  DeletionStep,
  {
    title: string;
    description: string;
  }
> = {
  1: {
    title: 'Review what happens next',
    description:
      'Deleting your account permanently removes all applications, reminders, and notes. This action cannot be undone.',
  },
  2: {
    title: 'Confirm your identity',
    description: 'Type your account email address to confirm you own this account.',
  },
  3: {
    title: 'Final confirmation',
    description: 'Optionally share why you are leaving, then delete your account.',
  },
};

export default function AccountDeletionDialog({ open, onOpenChange }: AccountDeletionDialogProps) {
  const { user, logout } = useAuth();
  const [step, setStep] = useState<DeletionStep>(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setAcknowledged(false);
      setEmailInput('');
      setReason('');
      setIsDeleting(false);
    }
  }, [open]);

  const canProceed = useMemo(() => {
    if (step === 1) {
      return acknowledged;
    }
    if (step === 2) {
      return emailInput.trim().toLowerCase() === user?.email.toLowerCase();
    }
    return true;
  }, [acknowledged, emailInput, step, user?.email]);

  const handleNext = async () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as DeletionStep);
      return;
    }

    if (!user) return;
    setIsDeleting(true);
    try {
      await usersApi.delete(user.id);
      toast.success('Account deleted. We hope to see you again.');
      logout();
      window.location.href = '/register';
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>{STEP_CONTENT[step].description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            This action is permanent. We cannot recover your data once it is deleted.
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Step {step} of 3
            </p>
            <h4 className="text-xl font-semibold">{STEP_CONTENT[step].title}</h4>

            {step === 1 && (
              <div className="space-y-3 rounded-md border p-4">
                <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                  <li>All job applications and interview notes are erased.</li>
                  <li>Reminders and notifications stop immediately.</li>
                  <li>Your login history and tokens are revoked.</li>
                </ul>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="h-4 w-4 rounded border-muted-foreground"
                  />
                  I understand these consequences.
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 rounded-md border p-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Enter <span className="font-semibold text-foreground">{user?.email}</span> to continue
                </label>
                <Input
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3 rounded-md border p-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Why are you leaving? (Optional)
                </label>
                <Textarea
                  placeholder="Help us improve..."
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={isDeleting} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={step === 3 ? 'destructive' : 'default'}
            onClick={handleNext}
            disabled={!canProceed || isDeleting}
            className="min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : step < 3 ? (
              'Continue'
            ) : (
              'Delete account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

