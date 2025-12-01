import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft } from '@/lib/lucide-icons';
import { applicationsApi } from '../api/client';
import { ApplicationStatus } from '../types/application.types';
import { toast } from 'react-hot-toast';

const applicationSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  status: z.enum([
    'APPLIED',
    'PHONE_SCREEN',
    'TECHNICAL',
    'ONSITE',
    'OFFER',
    'REJECTED',
    'INTERVIEW',
    'WITHDRAWN',
  ] as const),
  appliedDate: z.string().min(1, 'Applied date is required'),
  salary: z.string().optional(),
  jobBoardSource: z.string().optional(),
  jobUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function AddApplicationPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      status: 'APPLIED',
      appliedDate: new Date().toISOString().split('T')[0],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      return applicationsApi.create({
        companyName: data.companyName,
        position: data.position,
        status: data.status as ApplicationStatus,
        appliedDate: data.appliedDate,
        salary: data.salary ? parseInt(data.salary) : undefined,
        jobBoardSource: data.jobBoardSource,
        jobUrl: data.jobUrl,
        notes: data.notes,
      });
    },
    onSuccess: (result) => {
      toast.success('Application created successfully!');
      navigate(`/applications/${result.id}`);
    },
    onError: () => {
      toast.error('Failed to create application');
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/applications')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Application</h1>
          <p className="text-muted-foreground">Track a new job application</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-8 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company and Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                {...register('companyName')}
                placeholder="e.g., Google"
                className="mt-2"
              />
              {errors.companyName && (
                <p className="text-sm text-destructive mt-1">{errors.companyName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                {...register('position')}
                placeholder="e.g., Senior Software Engineer"
                className="mt-2"
              />
              {errors.position && (
                <p className="text-sm text-destructive mt-1">{errors.position.message}</p>
              )}
            </div>
          </div>

          {/* Status and Applied Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                defaultValue="APPLIED"
                onValueChange={(value) => setValue('status', value as ApplicationStatus)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="PHONE_SCREEN">Phone Screen</SelectItem>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                  <SelectItem value="ONSITE">Onsite</SelectItem>
                  <SelectItem value="OFFER">Offer</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="appliedDate">Applied Date *</Label>
              <Input
                id="appliedDate"
                type="date"
                {...register('appliedDate')}
                className="mt-2"
              />
              {errors.appliedDate && (
                <p className="text-sm text-destructive mt-1">{errors.appliedDate.message}</p>
              )}
            </div>
          </div>

          {/* Salary and Job Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary">Salary (Annual, USD)</Label>
              <Input
                id="salary"
                type="number"
                {...register('salary')}
                placeholder="e.g., 150000"
                className="mt-2"
              />
              {errors.salary && (
                <p className="text-sm text-destructive mt-1">{errors.salary.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="jobBoardSource">Job Board Source</Label>
              <Input
                id="jobBoardSource"
                {...register('jobBoardSource')}
                placeholder="e.g., LinkedIn, Indeed"
                className="mt-2"
              />
              {errors.jobBoardSource && (
                <p className="text-sm text-destructive mt-1">{errors.jobBoardSource.message}</p>
              )}
            </div>
          </div>

          {/* Job URL */}
          <div>
            <Label htmlFor="jobUrl">Job Posting URL</Label>
            <Input
              id="jobUrl"
              type="url"
              {...register('jobUrl')}
              placeholder="https://..."
              className="mt-2"
            />
            {errors.jobUrl && (
              <p className="text-sm text-destructive mt-1">{errors.jobUrl.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any additional notes about this application..."
              rows={4}
              className="mt-2"
            />
            {errors.notes && (
              <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/applications')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Application'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

