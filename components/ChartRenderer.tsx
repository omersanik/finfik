"use client";

import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
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

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie';
  title: string;
  description: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  data: ChartData;
}

interface ChartRendererProps {
  chartData: string;
  className?: string;
}

export default function ChartRenderer({ chartData, className = "" }: ChartRendererProps) {
  if (!chartData || chartData.trim() === '') {
    return (
      <div className={`p-4 text-center text-gray-500 bg-gray-50 rounded-lg ${className}`}>
        No chart data available
      </div>
    );
  }

  // Check if this looks like chart data (should start with { and contain chart-related fields)
  if (!chartData.trim().startsWith('{') || !chartData.includes('"type"')) {
    return (
      <div className={`p-4 text-center text-gray-500 bg-gray-50 rounded-lg ${className}`}>
        This content is not a chart. Please use the chart editor to create charts.
      </div>
    );
  }

  let config: ChartConfig;
  
  try {
    config = JSON.parse(chartData);
    
    // Validate the parsed config has required fields
    if (!config || typeof config !== 'object') {
      throw new Error('Config is not a valid object');
    }
    
    // Check if this is actually a chart config or just some other content
    if (!config.type || !config.title || !config.description) {
      return (
        <div className={`p-4 text-center text-gray-500 bg-gray-50 rounded-lg ${className}`}>
          Chart data is incomplete. Please use the chart editor to create a complete chart.
        </div>
      );
    }
    
  } catch (error) {
    console.error('Failed to parse chart data:', error);
    return (
      <div className={`p-4 text-center text-red-500 bg-red-50 rounded-lg ${className}`}>
        Invalid chart data format: {error instanceof Error ? error.message : 'Unknown error'}
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
        display: config.title ? true : false,
        text: config.title
      }
    },
    scales: config.type !== 'pie' ? {
      x: {
        title: {
          display: config.xAxisTitle ? true : false,
          text: config.xAxisTitle
        }
      },
      y: {
        title: {
          display: config.yAxisTitle ? true : false,
          text: config.yAxisTitle
        }
      }
    } : undefined
  };

  // Validate chart data structure
  if (!config.data || !config.data.labels || !config.data.datasets) {
    return (
      <div className={`p-4 text-center text-red-500 bg-red-50 rounded-lg ${className}`}>
        Invalid chart data structure. Missing labels or datasets.
      </div>
    );
  }

  const chartDataForDisplay = {
    labels: config.data.labels,
    datasets: config.data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: config.type === 'pie' ? 
        ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'] : 
        dataset.backgroundColor,
      borderColor: config.type === 'pie' ? 
        ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'] : 
        dataset.borderColor,
    }))
  };

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return <Line data={chartDataForDisplay} options={chartOptions} height={300} />;
      case 'bar':
        return <Bar data={chartDataForDisplay} options={chartOptions} height={300} />;
      case 'pie':
        return <Pie data={chartDataForDisplay} options={chartOptions} height={300} />;
      default:
        return <Line data={chartDataForDisplay} options={chartOptions} height={300} />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart */}
      <div className="border rounded-lg p-4 bg-white">
        {renderChart()}
      </div>
      
      {/* Description */}
      {config.description && (
        <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
          {config.description}
        </p>
      )}
    </div>
  );
} 