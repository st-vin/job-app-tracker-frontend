import React, { useMemo, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "@/lib/lucide-icons";
import { TrendingDown } from "@/lib/lucide-icons";
import { Calendar } from "@/lib/lucide-icons";
import { DollarSign } from "@/lib/lucide-icons";
import { Briefcase } from "@/lib/lucide-icons";
import { Target } from "@/lib/lucide-icons";
import { Activity } from "@/lib/lucide-icons";
import { BarChart3 } from "@/lib/lucide-icons";
import { applicationsApi } from "../api/client";
import { Application, ApplicationStatus } from "../types/application.types";
import { format, subDays, startOfWeek, endOfWeek, eachWeekOfInterval, parseISO, isWithinInterval } from "date-fns";

// Lazy load chart components
const DailyTrendsChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.DailyTrendsChart })));
const WeeklyTrendsChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.WeeklyTrendsChart })));
const ResponseRateChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.ResponseRateChart })));
const StatusDistributionChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.StatusDistributionChart })));
const ConversionFunnelChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.ConversionFunnelChart })));
const SalaryDistributionChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.SalaryDistributionChart })));
const AvgSalaryByStatusChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.AvgSalaryByStatusChart })));
const SalaryTrendsChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.SalaryTrendsChart })));
const SourceDataChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.SourceDataChart })));
const TopCompaniesChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.TopCompaniesChart })));
const DayOfWeekChart = lazy(() => import("../components/charts/AnalyticsCharts").then(m => ({ default: m.DayOfWeekChart })));

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
  status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export default function AnalyticsPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationsApi.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Calculate various analytics
  const analytics = useMemo(() => {
    if (!applications || applications.length === 0) {
      return null;
    }

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const ninetyDaysAgo = subDays(now, 90);
    const sixMonthsAgo = subDays(now, 180);

    // Filter applications by date range
    const recentApps = applications.filter((app) => {
      const appDate = parseISO(app.appliedDate);
      return appDate >= thirtyDaysAgo;
    });

    const last90Days = applications.filter((app) => {
      const appDate = parseISO(app.appliedDate);
      return appDate >= ninetyDaysAgo;
    });

    // 1. Application Trends Over Time (Daily for last 30 days)
    const dailyTrends = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, 29 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = applications.filter((app) => {
        const appDate = format(parseISO(app.appliedDate), "yyyy-MM-dd");
        return appDate === dateStr;
      }).length;
      return {
        date: format(date, "MMM dd"),
        applications: count,
        fullDate: dateStr,
      };
    });

    // 2. Weekly Application Velocity
    const weeks = eachWeekOfInterval(
      { start: sixMonthsAgo, end: now },
      { weekStartsOn: 1 }
    );
    const weeklyTrends = weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const count = applications.filter((app) => {
        const appDate = parseISO(app.appliedDate);
        return isWithinInterval(appDate, { start: weekStart, end: weekEnd });
      }).length;
      return {
        week: format(weekStart, "MMM dd"),
        applications: count,
      };
    });

    // 3. Status Progression Funnel
    const statusCounts = Object.keys(STATUS_COLORS).map((status) => ({
      status: formatStatusLabel(status),
      count: applications.filter((app) => app.status === status).length,
      color: STATUS_COLORS[status as ApplicationStatus],
    }));

    // 4. Salary Distribution (if available)
    const appsWithSalary = applications.filter((app) => app.salary && app.salary > 0);
    const salaryRanges = [
      { range: "0-50K", min: 0, max: 50000, count: 0 },
      { range: "50-75K", min: 50000, max: 75000, count: 0 },
      { range: "75-100K", min: 75000, max: 100000, count: 0 },
      { range: "100-125K", min: 100000, max: 125000, count: 0 },
      { range: "125-150K", min: 125000, max: 150000, count: 0 },
      { range: "150-200K", min: 150000, max: 200000, count: 0 },
      { range: "200K+", min: 200000, max: Infinity, count: 0 },
    ];

    appsWithSalary.forEach((app) => {
      const salary = app.salary!;
      const range = salaryRanges.find((r) => salary >= r.min && salary < r.max);
      if (range) range.count++;
    });

    // 5. Applications by Job Board Source
    const sourceCounts = applications.reduce((acc, app) => {
      const source = app.jobBoardSource || "Direct/Other";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sourceData = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 6. Average Salary by Status
    const avgSalaryByStatus = Object.keys(STATUS_COLORS).map((status) => {
      const statusApps = applications.filter(
        (app) => app.status === status && app.salary && app.salary > 0
      );
      const avgSalary =
        statusApps.length > 0
          ? statusApps.reduce((sum, app) => sum + (app.salary || 0), 0) / statusApps.length
          : 0;
      return {
        status: formatStatusLabel(status),
        avgSalary: Math.round(avgSalary / 1000), // Convert to thousands
        count: statusApps.length,
      };
    }).filter((item) => item.count > 0);

    // 7. Response Rate Over Time (applications that moved beyond APPLIED)
    const responseRates = Array.from({ length: 12 }, (_, i) => {
      const monthStart = subDays(now, (11 - i) * 30);
      const monthEnd = subDays(now, (10 - i) * 30);
      const monthApps = applications.filter((app) => {
        const appDate = parseISO(app.appliedDate);
        return isWithinInterval(appDate, { start: monthStart, end: monthEnd });
      });
      const responded = monthApps.filter((app) => app.status !== "APPLIED").length;
      const responseRate = monthApps.length > 0 ? (responded / monthApps.length) * 100 : 0;
      return {
        month: format(monthStart, "MMM"),
        responseRate: Math.round(responseRate * 10) / 10,
        total: monthApps.length,
        responded,
      };
    });

    // 8. Top Companies by Application Count
    const companyCounts = applications.reduce((acc, app) => {
      acc[app.companyName] = (acc[app.companyName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCompanies = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 9. Conversion Funnel (Status Progression)
    const conversionFunnel = [
      { stage: "Applied", count: statusCounts.find((s) => s.status === "Applied")?.count || 0 },
      {
        stage: "Phone Screen",
        count: statusCounts.find((s) => s.status === "Phone Screen")?.count || 0,
      },
      {
        stage: "Technical",
        count: statusCounts.find((s) => s.status === "Technical")?.count || 0,
      },
      { stage: "Onsite", count: statusCounts.find((s) => s.status === "Onsite")?.count || 0 },
      { stage: "Offer", count: statusCounts.find((s) => s.status === "Offer")?.count || 0 },
    ];

    // 10. Application Activity Heatmap (by day of week)
    const dayOfWeekCounts = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
      const count = applications.filter((app) => {
        const appDate = parseISO(app.appliedDate);
        return appDate.getDay() === (index === 0 ? 1 : index === 6 ? 0 : index + 1);
      }).length;
      return { day, count };
    });

    // 11. Success Metrics
    const totalApplications = applications.length;
    const offers = applications.filter((app) => app.status === "OFFER").length;
    const rejections = applications.filter((app) => app.status === "REJECTED").length;
    const active = applications.filter(
      (app) => !["REJECTED", "WITHDRAWN", "OFFER"].includes(app.status)
    ).length;
    const offerRate = totalApplications > 0 ? (offers / totalApplications) * 100 : 0;
    const rejectionRate = totalApplications > 0 ? (rejections / totalApplications) * 100 : 0;

    // 12. Salary Trends Over Time
    const salaryTrends = Array.from({ length: 6 }, (_, i) => {
      const monthStart = subDays(now, (5 - i) * 30);
      const monthEnd = subDays(now, (4 - i) * 30);
      const monthApps = applications.filter((app) => {
        const appDate = parseISO(app.appliedDate);
        return isWithinInterval(appDate, { start: monthStart, end: monthEnd }) && app.salary && app.salary > 0;
      });
      const avgSalary =
        monthApps.length > 0
          ? monthApps.reduce((sum, app) => sum + (app.salary || 0), 0) / monthApps.length
          : 0;
      return {
        month: format(monthStart, "MMM"),
        avgSalary: Math.round(avgSalary / 1000),
        count: monthApps.length,
      };
    }).filter((item) => item.count > 0);

    return {
      dailyTrends,
      weeklyTrends,
      statusCounts,
      salaryRanges: salaryRanges.filter((r) => r.count > 0),
      sourceData,
      avgSalaryByStatus,
      responseRates,
      topCompanies,
      conversionFunnel,
      dayOfWeekCounts,
      salaryTrends,
      metrics: {
        totalApplications,
        offers,
        rejections,
        active,
        offerRate,
        rejectionRate,
        recentApps: recentApps.length,
        last90Days: last90Days.length,
      },
    };
  }, [applications]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">Deep insights into your job application data</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">Deep insights into your job application data</p>
          </div>
        </div>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No data available. Start adding applications to see analytics.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">Deep insights into your job application data</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-3xl font-bold mt-2">{analytics.metrics.totalApplications}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.metrics.recentApps} in last 30 days
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Offer Rate</p>
              <p className="text-3xl font-bold mt-2">{analytics.metrics.offerRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.metrics.offers} offers received
              </p>
            </div>
            <Target className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Applications</p>
              <p className="text-3xl font-bold mt-2">{analytics.metrics.active}</p>
              <p className="text-xs text-muted-foreground mt-1">
                In progress
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejection Rate</p>
              <p className="text-3xl font-bold mt-2">{analytics.metrics.rejectionRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.metrics.rejections} rejections
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Application Trends Over Time */}
      <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
        <DailyTrendsChart data={analytics.dailyTrends} />
      </Suspense>

      {/* Weekly Velocity and Response Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
          <WeeklyTrendsChart data={analytics.weeklyTrends} />
        </Suspense>
        <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
          <ResponseRateChart data={analytics.responseRates} />
        </Suspense>
      </div>

      {/* Status Distribution and Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
          <StatusDistributionChart data={analytics.statusCounts} />
        </Suspense>
        <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
          <ConversionFunnelChart data={analytics.conversionFunnel} />
        </Suspense>
      </div>

      {/* Salary Analytics */}
      {analytics.salaryRanges.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
            <SalaryDistributionChart data={analytics.salaryRanges} />
          </Suspense>
          {analytics.avgSalaryByStatus.length > 0 && (
            <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
              <AvgSalaryByStatusChart data={analytics.avgSalaryByStatus} />
            </Suspense>
          )}
        </div>
      )}

      {/* Salary Trends */}
      {analytics.salaryTrends.length > 0 && (
        <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
          <SalaryTrendsChart data={analytics.salaryTrends} />
        </Suspense>
      )}

      {/* Job Board Sources and Top Companies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {analytics.sourceData.length > 0 && (
          <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
            <SourceDataChart data={analytics.sourceData} />
          </Suspense>
        )}
        {analytics.topCompanies.length > 0 && (
          <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
            <TopCompaniesChart data={analytics.topCompanies} />
          </Suspense>
        )}
      </div>

      {/* Application Activity by Day of Week */}
      <Suspense fallback={<Card className="p-6"><Skeleton className="h-[300px]" /></Card>}>
        <DayOfWeekChart data={analytics.dayOfWeekCounts} />
      </Suspense>
    </div>
  );
}


