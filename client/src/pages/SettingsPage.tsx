import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Palette, Settings, ShieldAlert, Trash2 } from '@/lib/lucide-icons';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import AccountDeletionDialog from '@/components/account/AccountDeletionDialog';

type Preferences = {
  emailNotifications: boolean;
  reminderPush: boolean;
  weeklyDigest: boolean;
  autoArchive: boolean;
};

const defaultPreferences: Preferences = {
  emailNotifications: true,
  reminderPush: true,
  weeklyDigest: false,
  autoArchive: false,
};

const PREFERENCE_STORAGE_KEY = 'job_tracker_preferences';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFERENCE_STORAGE_KEY);
      if (saved) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Failed to parse saved preferences', error);
    }
  }, []);

  const handlePreferenceChange = (key: keyof Preferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const savePreferences = () => {
    setIsSavingPrefs(true);
    try {
      localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(preferences));
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Unable to save preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const preferenceItems = useMemo(
    () => [
      {
        id: 'emailNotifications',
        title: 'Email notifications',
        description: 'Receive application updates via email.',
      },
      {
        id: 'reminderPush',
        title: 'Reminder prompts',
        description: 'Get in-app reminders before interviews.',
      },
      {
        id: 'weeklyDigest',
        title: 'Weekly digest',
        description: 'Summary of your pipeline every Monday morning.',
      },
      {
        id: 'autoArchive',
        title: 'Auto-archive',
        description: 'Close inactive applications after 60 days.',
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Account</p>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Control preferences for notifications, theme, and security.</p>
          </div>
          {user && (
            <Badge variant="secondary">
              Signed in as {user.firstName} {user.lastName}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Fine-tune how you stay in the loop.</p>
            </div>
          </div>

          <div className="space-y-5">
            {preferenceItems.map((pref) => (
              <div key={pref.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{pref.title}</p>
                  <p className="text-sm text-muted-foreground">{pref.description}</p>
                </div>
                <Switch
                  checked={preferences[pref.id as keyof Preferences]}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange(pref.id as keyof Preferences, checked)
                  }
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={isSavingPrefs}>
              {isSavingPrefs ? 'Saving...' : 'Save preferences'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">Switch between light and dark modes.</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Dark mode</p>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark to match your workspace.
              </p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={() => toggleTheme?.()} />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Workspace defaults</p>
                <p className="text-sm text-muted-foreground">
                  Theme preference syncs across devices when you log in.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-4 border-destructive/50">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-destructive/10 p-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-destructive">Danger zone</h2>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          This cannot be undone. We recommend exporting required data before continuing.
        </p>

        <Button variant="destructive" className="gap-2" onClick={() => setDeletionDialogOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete account
        </Button>
      </Card>

      <AccountDeletionDialog open={deletionDialogOpen} onOpenChange={setDeletionDialogOpen} />
    </div>
  );
}


