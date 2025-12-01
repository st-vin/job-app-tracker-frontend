import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card } from '@/components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatusDistributionChartProps {
  data: Array<{ status: string; count: number; color: string }>;
  formatStatusLabel: (status: string) => string;
}

export function DashboardStatusChart({ data, formatStatusLabel }: StatusDistributionChartProps) {
  const chartData = {
    labels: data.map(d => formatStatusLabel(d.status)),
    datasets: [
      {
        label: 'Applications',
        data: data.map(d => d.count),
        backgroundColor: data.map(d => d.color),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
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
    <div style={{ height: '320px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

