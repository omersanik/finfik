"use client";

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface FinancialChartProps {
  type: 'line' | 'area' | 'bar' | 'pie';
  data: ChartData[];
  title?: string;
  description?: string;
  xAxisDataKey?: string;
  yAxisDataKey?: string;
  colors?: string[];
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function FinancialChart({
  type,
  data,
  title,
  description,
  xAxisDataKey = 'name',
  yAxisDataKey = 'value',
  colors = COLORS,
  height = 300
}: FinancialChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={yAxisDataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey={yAxisDataKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxisDataKey} fill={colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yAxisDataKey}
                activeIndex={activeIndex}
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return <TrendingUp className="h-5 w-5" />;
      case 'area':
        return <Activity className="h-5 w-5" />;
      case 'bar':
        return <BarChart3 className="h-5 w-5" />;
      case 'pie':
        return <PieChartIcon className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full">
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className="flex items-center gap-2">
              {getChartIcon()}
              {title}
            </CardTitle>
          )}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}

// Predefined chart data for common financial scenarios
export const getSampleData = (type: string) => {
  switch (type) {
    case 'investment_growth':
      return [
        { year: 'Year 1', value: 10000 },
        { year: 'Year 2', value: 11000 },
        { year: 'Year 3', value: 12100 },
        { year: 'Year 4', value: 13310 },
        { year: 'Year 5', value: 14641 },
      ];
    
    case 'monthly_expenses':
      return [
        { category: 'Housing', value: 1200 },
        { category: 'Transportation', value: 400 },
        { category: 'Food', value: 600 },
        { category: 'Utilities', value: 200 },
        { category: 'Entertainment', value: 300 },
        { category: 'Savings', value: 500 },
      ];
    
    case 'stock_performance':
      return [
        { month: 'Jan', value: 100 },
        { month: 'Feb', value: 105 },
        { month: 'Mar', value: 98 },
        { month: 'Apr', value: 112 },
        { month: 'May', value: 108 },
        { month: 'Jun', value: 115 },
      ];
    
    default:
      return [
        { name: 'Item 1', value: 100 },
        { name: 'Item 2', value: 200 },
        { name: 'Item 3', value: 150 },
        { name: 'Item 4', value: 300 },
      ];
  }
}; 