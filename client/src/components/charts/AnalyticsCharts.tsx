import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Chart } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, Activity, BarChart3, Target, DollarSign, Briefcase } from '@/lib/lucide-icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyTrendsChartProps {
  data: Array<{ date: string; applications: number; fullDate: string }>;
}

export function DailyTrendsChart({ data }: DailyTrendsChartProps) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.applications),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} applications`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Application Trends (Last 30 Days)
        </h2>
        <p className="text-sm text-muted-foreground">
          Daily application submission volume
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface WeeklyTrendsChartProps {
  data: Array<{ week: string; applications: number }>;
}

export function WeeklyTrendsChart({ data }: WeeklyTrendsChartProps) {
  const chartData = {
    labels: data.map(d => d.week),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.applications),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#8b5cf6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} applications`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Weekly Application Velocity
        </h2>
        <p className="text-sm text-muted-foreground">
          Applications per week over the last 6 months
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface ResponseRateChartProps {
  data: Array<{ month: string; responseRate: number; total: number; responded: number }>;
}

export function ResponseRateChart({ data }: ResponseRateChartProps) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Response Rate %',
        data: data.map(d => d.responseRate),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        yAxisID: 'y',
        type: 'line' as const,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Total Applications',
        data: data.map(d => d.total),
        backgroundColor: 'rgba(148, 163, 184, 0.3)',
        yAxisID: 'y1',
        type: 'bar' as const,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 0) {
              return `Response Rate: ${context.parsed.y}%`;
            }
            return `Total Applications: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Response Rate %',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Total Apps',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Response Rate Over Time
        </h2>
        <p className="text-sm text-muted-foreground">
          Percentage of applications that received responses
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Chart type="line" data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface StatusDistributionChartProps {
  data: Array<{ status: string; count: number; color: string }>;
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const chartData = {
    labels: data.map(d => d.status),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.count),
        backgroundColor: data.map(d => d.color),
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.x} applications`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Status Distribution
        </h2>
        <p className="text-sm text-muted-foreground">
          Current distribution across all statuses
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface ConversionFunnelChartProps {
  data: Array<{ stage: string; count: number }>;
}

export function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  const chartData = {
    labels: data.map(d => d.stage),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.count),
        backgroundColor: '#3b82f6',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} applications`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Conversion Funnel
        </h2>
        <p className="text-sm text-muted-foreground">
          Applications progressing through stages
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface SalaryDistributionChartProps {
  data: Array<{ range: string; count: number }>;
}

export function SalaryDistributionChart({ data }: SalaryDistributionChartProps) {
  const chartData = {
    labels: data.map(d => d.range),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.count),
        backgroundColor: '#10b981',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} applications`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Salary Distribution
        </h2>
        <p className="text-sm text-muted-foreground">
          Distribution of salary ranges
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface AvgSalaryByStatusChartProps {
  data: Array<{ status: string; avgSalary: number; count: number }>;
}

export function AvgSalaryByStatusChart({ data }: AvgSalaryByStatusChartProps) {
  const chartData = {
    labels: data.map(d => d.status),
    datasets: [
      {
        label: 'Average Salary (K)',
        data: data.map(d => d.avgSalary),
        backgroundColor: '#f59e0b',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.parsed.y}K`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Salary (K)',
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Average Salary by Status
        </h2>
        <p className="text-sm text-muted-foreground">
          Mean salary at each application stage
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface SalaryTrendsChartProps {
  data: Array<{ month: string; avgSalary: number; count: number }>;
}

export function SalaryTrendsChart({ data }: SalaryTrendsChartProps) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Average Salary (K)',
        data: data.map(d => d.avgSalary),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: false,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#f59e0b',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.parsed.y}K`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Salary (K)',
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Salary Trends Over Time
        </h2>
        <p className="text-sm text-muted-foreground">
          Average salary of applications by month
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface SourceDataChartProps {
  data: Array<{ source: string; count: number }>;
}

export function SourceDataChart({ data }: SourceDataChartProps) {
  const chartData = {
    labels: data.map(d => d.source),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.count),
        backgroundColor: '#8b5cf6',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.x} applications`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Applications by Job Board Source
        </h2>
        <p className="text-sm text-muted-foreground">
          Top sources for job applications
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface TopCompaniesChartProps {
  data: Array<{ company: string; count: number }>;
}

export function TopCompaniesChart({ data }: TopCompaniesChartProps) {
  const chartData = {
    labels: data.map(d => d.company),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.count),
        backgroundColor: '#ec4899',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.x} applications`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Top Companies by Applications
        </h2>
        <p className="text-sm text-muted-foreground">
          Companies you've applied to most
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}

interface DayOfWeekChartProps {
  data: Array<{ day: string; count: number }>;
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const chartData = {
    labels: data.map(d => d.day),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.count),
        backgroundColor: '#06b6d4',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y} applications`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Application Activity by Day of Week
        </h2>
        <p className="text-sm text-muted-foreground">
          When you typically submit applications
        </p>
      </div>
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  );
}


