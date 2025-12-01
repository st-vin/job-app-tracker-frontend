import React, { Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "@/lib/lucide-icons";
import { TrendingUp } from "@/lib/lucide-icons";
import { DollarSign } from "@/lib/lucide-icons";
import { Calendar } from "@/lib/lucide-icons";

// Lazy load chart component
const DashboardStatusChart = lazy(() => import("../components/charts/DashboardChart").then(m => ({ default: m.DashboardStatusChart })));
import { dashboardApi, applicationsApi, remindersApi } from "../api/client";
import { ApplicationStatus } from "../types/application.types";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  APPLIED: "#3b82f6",
  PHONE_SCREEN: "#8b5cf6",
  TECHNICAL: "#ec4899",
  ONSITE: "#f59e0b",
  OFFER: "#10b981",
  REJECTED: "#ef4444",
  INTERVIEW: "#06b6d4",
  WITHDRAWN: "#6b7280",
};

const formatStatusLabel = (status: string) =>
  status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: reminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersApi.getAll(),
  });

  const chartData =
    stats && stats.byStatus
      ? Object.entries(stats.byStatus).map(([status, count]) => ({
          status,
          count,
          color: STATUS_COLORS[status as ApplicationStatus],
        }))
      : [];

  const upcomingReminders = reminders?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your job application overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/applications')}>
            View All
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-20" />
              </Card>
            ))}
          </>
        ) : stats ? (
          <>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalApplications}</p>
                </div>
                <Briefcase className="w-8 h-8 text-primary opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last 30 Days</p>
                  <p className="text-3xl font-bold mt-2">{stats.last30DaysSubmissions}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Salary</p>
                  <p className="text-3xl font-bold mt-2">
                    ${(stats.averageSalary / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Offers</p>
                  <p className="text-3xl font-bold mt-2">{stats.byStatus.OFFER}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </Card>
          </>
        ) : null}
      </div>

      {/* Charts and Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Chart */}
        <Card className="lg:col-span-2 p-6">
          <div>
            <h2 className="text-lg font-semibold">Status Distribution</h2>
            <p className="text-sm text-muted-foreground">
              Track how opportunities move through your funnel.
            </p>
          </div>
          <div className="mt-6">
            {statsLoading ? (
              <Skeleton className="h-80" />
            ) : chartData.length > 0 ? (
              <Suspense fallback={<Skeleton className="h-80" />}>
                <DashboardStatusChart data={chartData} formatStatusLabel={formatStatusLabel} />
              </Suspense>
            ) : (
              <div className="flex h-80 items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Reminders</h2>
          {upcomingReminders.length > 0 ? (
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{reminder.reminderMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(reminder.reminderDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming reminders</p>
          )}
        </Card>
      </div>
    </div>
  );
}

