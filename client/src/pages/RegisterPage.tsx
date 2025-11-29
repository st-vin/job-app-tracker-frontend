import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../api/client';
import { toast } from 'react-hot-toast';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [emailExists, setEmailExists] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const email = watch('email');

  // Debounced email existence check
  const checkEmailExists = useCallback(async (emailValue: string) => {
    if (!emailValue || !emailValue.includes('@')) return;

    setIsCheckingEmail(true);
    try {
      const result = await authApi.checkEmailExists(emailValue);
      setEmailExists(result.exists);
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (email) {
        checkEmailExists(email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, checkEmailExists]);

  const onSubmit = async (data: RegisterFormData) => {
    if (emailExists) {
      toast.error('Email already registered');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      toast.success('Registration successful! Check your email to verify your account.');
      navigate('/verify-email', { state: { email: data.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission on Enter key in input fields
    // Users must click the submit button to register
    if (e.key === 'Enter' && e.currentTarget.type !== 'submit') {
      e.preventDefault();
      // Optionally move to next field or do nothing
      const form = e.currentTarget.form;
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input:not([type="submit"])')) as HTMLInputElement[];
        const currentIndex = inputs.indexOf(e.currentTarget);
        const nextInput = inputs[currentIndex + 1];
        
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join us to track your job applications</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              <Input {...register('firstName')} placeholder="John" onKeyDown={handleKeyDown} />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <Input {...register('lastName')} placeholder="Doe" onKeyDown={handleKeyDown} />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Input {...register('email')} type="email" placeholder="you@example.com" onKeyDown={handleKeyDown} />
              {isCheckingEmail && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin" />}
            </div>
            {emailExists && (
              <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                Email already registered
              </div>
            )}
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input {...register('password')} type="password" placeholder="••••••••" onKeyDown={handleKeyDown} />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <Input {...register('confirmPassword')} type="password" placeholder="••••••••" onKeyDown={handleKeyDown} />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || emailExists}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              Login
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
