import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usersApi } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Current password must be at least 8 characters'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
    },
  });

  const {
    handleSubmit: handlePasswordSubmit,
    register: registerPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [reset, user]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No user information available.</p>
      </div>
    );
  }

  const onProfileSubmit = async (values: ProfileFormData) => {
    setIsSavingProfile(true);
    try {
      const updatedUser = await usersApi.update(user.id, values);
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (values: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      await usersApi.changePassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password updated');
      resetPasswordForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Profile</p>
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <p className="text-muted-foreground mt-2">
            Update your personal details and keep your credentials secure.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/profile')}>
          Cancel
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Personal information</h2>
            <p className="text-sm text-muted-foreground">These details are shared across your workspace.</p>
          </div>

          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="Jane" {...register('firstName')} />
                {profileErrors.firstName && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Doe" {...register('lastName')} />
                {profileErrors.lastName && (
                  <p className="text-sm text-destructive mt-1">{profileErrors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {profileErrors.email && (
                <p className="text-sm text-destructive mt-1">{profileErrors.email.message}</p>
              )}
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Password</h2>
            <p className="text-sm text-muted-foreground">
              Choose a strong password to keep your account secure.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                {...registerPassword('currentPassword')}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                {...registerPassword('newPassword')}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...registerPassword('confirmPassword')}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" variant="secondary" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update password'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

