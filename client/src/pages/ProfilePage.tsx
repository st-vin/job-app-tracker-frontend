import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { applicationsApi } from '../api/client';
import { User, LogOut, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.getAll(),
  });

  const activeApplications = applications?.filter(
    (app) => !['REJECTED', 'WITHDRAWN'].includes(app.status)
  ).length || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/profile/edit')}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="p-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground mt-1">{user.email}</p>

            {user.role && (
              <div className="mt-3">
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Total Applications
          </h3>
          <p className="text-4xl font-bold">{applications?.length || 0}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Active Applications
          </h3>
          <p className="text-4xl font-bold">{activeApplications}</p>
        </Card>
      </div>

      {/* Account Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Account Actions</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/settings')}
          >
            Settings & Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
}
