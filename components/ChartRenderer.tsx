"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartConfig {
  type: 'line' | 'bar' | 'pie';
  title: string;
  description: string;
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  yAxis?: {
    title?: string;
    min?: number;
    max?: number;
    stepSize?: number;
  };
}

interface ChartRendererProps {
  chartData: string;
  className?: string;
}

export default function ChartRenderer({ chartData, className }: ChartRendererProps) {
  let config: ChartConfig;
  
  // Handle empty or invalid chart data
  if (!chartData || chartData.trim() === '') {
    return (
      <div className={`p-4 border border-yellow-200 bg-yellow-50 rounded-lg ${className}`}>
        <p className="text-yellow-600">Chart configuration is empty. Please configure the chart in the admin panel.</p>
      </div>
    );
  }
  
  try {
    config = JSON.parse(chartData);
  } catch (error) {
    console.error('Failed to parse chart data:', error);
    return (
      <div className={`p-4 border border-red-200 bg-red-50 rounded-lg ${className}`}>
        <p className="text-red-600">Error: Invalid chart data format</p>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!config.title,
        text: config.title,
      },
    },
    scales: config.type !== 'pie' ? {
      y: {
        beginAtZero: config.yAxis?.min === 0,
        min: config.yAxis?.min,
        max: config.yAxis?.max,
        ticks: {
          stepSize: config.yAxis?.stepSize,
        },
        title: {
          display: !!config.yAxis?.title,
          text: config.yAxis?.title,
        },
      },
      x: {
        title: {
          display: false,
        },
      },
    } : undefined,
  };

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return <Line data={config.data} options={chartOptions} />;
      case 'bar':
        return <Bar data={config.data} options={chartOptions} />;
      case 'pie':
        return <Pie data={config.data} options={chartOptions} />;
      default:
        return (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <p className="text-red-600">Unsupported chart type: {config.type}</p>
            <p className="text-sm text-gray-600 mt-1">Supported types: line, bar, pie</p>
          </div>
        );
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      {config.description && (
        <p className="text-sm text-gray-600 mb-4">{config.description}</p>
      )}
      <div className="h-64 w-full">
        {renderChart()}
      </div>
    </div>
  );
} 