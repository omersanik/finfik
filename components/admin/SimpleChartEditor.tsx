"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, BarChart3, LineChart, PieChart, Eye, EyeOff } from 'lucide-react';
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
  data: ChartData;
  xAxisTitle?: string;
  yAxisTitle?: string;
}

interface SimpleChartEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const chartTypes = [
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
];

const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
];

const defaultChartConfig: ChartConfig = {
  type: 'line',
  title: 'Sample Chart',
  description: 'A sample chart for demonstration',
  xAxisTitle: 'Time Period',
  yAxisTitle: 'Value',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Sales',
      data: [65, 59, 80, 81],
      backgroundColor: defaultColors[0],
      borderColor: defaultColors[0],
      borderWidth: 2
    }]
  }
};

export default function SimpleChartEditor({ value, onChange, placeholder }: SimpleChartEditorProps) {
  const [chartType, setChartType] = useState('line');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [xAxisTitle, setXAxisTitle] = useState('');
  const [yAxisTitle, setYAxisTitle] = useState('');
  const [chartData, setChartData] = useState<ChartData>(defaultChartConfig.data);
  const [showPreview, setShowPreview] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize with existing data or defaults
  useEffect(() => {
    if (!initialized) {
      if (value && value.trim() !== '') {
        try {
          const parsed = JSON.parse(value);
          setChartType(parsed.type || 'line');
          setTitle(parsed.title || '');
          setDescription(parsed.description || '');
          setXAxisTitle(parsed.xAxisTitle || '');
          setYAxisTitle(parsed.yAxisTitle || '');
          setChartData(parsed.data || defaultChartConfig.data);
        } catch (e) {
          console.log('Could not parse existing chart data, using defaults');
          setChartType('line');
          setTitle('');
          setDescription('');
          setXAxisTitle('');
          setYAxisTitle('');
          setChartData(defaultChartConfig.data);
        }
      } else {
        // No existing value, use defaults
        setChartType('line');
        setTitle('');
        setDescription('');
        setChartData(defaultChartConfig.data);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Save changes to parent (only when explicitly called)
  const saveChanges = () => {
    const chartConfig: ChartConfig = {
      type: chartType as 'line' | 'bar' | 'pie',
      title,
      description,
      xAxisTitle,
      yAxisTitle,
      data: chartData
    };
    onChange(JSON.stringify(chartConfig, null, 2));
  };

  // Only save when the form is submitted, not automatically
  // useEffect(() => {
  //   if (initialized) {
  //     saveChanges();
  //   }
  // }, [chartType, title, description, xAxisTitle, yAxisTitle, chartData, initialized]);

  const addDataset = () => {
    const newDatasetIndex = chartData.datasets.length;
    setChartData(prev => ({
      ...prev,
      datasets: [...prev.datasets, {
        label: `Dataset ${newDatasetIndex + 1}`,
        data: Array(prev.labels.length).fill(0),
        backgroundColor: defaultColors[newDatasetIndex % defaultColors.length],
        borderColor: defaultColors[newDatasetIndex % defaultColors.length],
        borderWidth: 2
      }]
    }));
  };

  const removeDataset = (index: number) => {
    if (chartData.datasets.length > 1) {
      setChartData(prev => ({
        ...prev,
        datasets: prev.datasets.filter((_, i) => i !== index)
      }));
    }
  };

  const addLabel = () => {
    setChartData(prev => ({
      ...prev,
      labels: [...prev.labels, `Label ${prev.labels.length + 1}`],
      datasets: prev.datasets.map(dataset => ({
        ...dataset,
        data: [...dataset.data, 0]
      }))
    }));
  };

  const removeLabel = (index: number) => {
    if (chartData.labels.length > 1) {
      setChartData(prev => ({
        ...prev,
        labels: prev.labels.filter((_, i) => i !== index),
        datasets: prev.datasets.map(dataset => ({
          ...dataset,
          data: dataset.data.filter((_, i) => i !== index)
        }))
      }));
    }
  };

  const updateLabel = (index: number, value: string) => {
    setChartData(prev => ({
      ...prev,
      labels: prev.labels.map((label, i) => i === index ? value : label)
    }));
  };

  const updateDatasetData = (datasetIndex: number, dataIndex: number, value: number) => {
    setChartData(prev => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) => 
        i === datasetIndex 
          ? { ...dataset, data: dataset.data.map((d, j) => j === dataIndex ? value : d) }
          : dataset
      )
    }));
  };

  const updateDatasetLabel = (index: number, value: string) => {
    setChartData(prev => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) => 
        i === index ? { ...dataset, label: value } : dataset
      )
    }));
  };

  const updateDatasetColor = (index: number, color: string) => {
    setChartData(prev => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) => 
        i === index ? { 
          ...dataset, 
          backgroundColor: color,
          borderColor: color
        } : dataset
      )
    }));
  };

  const renderChart = () => {
      const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: title ? true : false,
        text: title
      }
    },
    scales: chartType !== 'pie' ? {
      x: {
        title: {
          display: xAxisTitle ? true : false,
          text: xAxisTitle
        }
      },
      y: {
        title: {
          display: yAxisTitle ? true : false,
          text: yAxisTitle
        }
      }
    } : undefined
  };

    const chartDataForDisplay = {
      labels: chartData.labels,
      datasets: chartData.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor: chartType === 'pie' ? defaultColors : dataset.backgroundColor,
        borderColor: chartType === 'pie' ? defaultColors : dataset.borderColor,
      }))
    };

    switch (chartType) {
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

  if (!initialized) {
    return <div className="flex items-center justify-center p-8">Loading chart editor...</div>;
  }

  return (
    <div className="space-y-6">
             {/* Header with Preview Toggle and Save Button */}
       <div className="flex items-center justify-between">
         <h3 className="text-lg font-semibold">Chart Editor</h3>
         <div className="flex gap-2">
           <Button
             type="button"
             variant="default"
             size="sm"
             onClick={saveChanges}
           >
             Save Chart
           </Button>
           <Button
             type="button"
             variant="outline"
             size="sm"
             onClick={() => setShowPreview(!showPreview)}
           >
             {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
             {showPreview ? 'Hide Preview' : 'Show Preview'}
           </Button>
         </div>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Chart Configuration */}
        <div className="space-y-4">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Chart Type</Label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Chart Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chart title"
                />
              </div>

                             <div>
                 <Label>Description</Label>
                 <Textarea
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Enter chart description"
                   rows={2}
                 />
               </div>

               {/* Axis Titles */}
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <Label>X-Axis Title</Label>
                   <Input
                     value={xAxisTitle}
                     onChange={(e) => setXAxisTitle(e.target.value)}
                     placeholder="e.g., Months, Quarters, Categories"
                   />
                 </div>
                 <div>
                   <Label>Y-Axis Title</Label>
                   <Input
                     value={yAxisTitle}
                     onChange={(e) => setYAxisTitle(e.target.value)}
                     placeholder="e.g., Sales, Revenue, Count"
                   />
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Data Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Labels */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Labels (X-axis)</Label>
                  <Button size="sm" onClick={addLabel} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {chartData.labels.map((label, index) => (
                    <div key={index} className="flex gap-1">
                      <Input
                        value={label}
                        onChange={(e) => updateLabel(index, e.target.value)}
                        className="text-sm"
                        placeholder="Label"
                      />
                      {chartData.labels.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeLabel(index)}
                          className="px-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Datasets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Datasets</Label>
                  <Button size="sm" onClick={addDataset} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {chartData.datasets.map((dataset, datasetIndex) => (
                    <div key={datasetIndex} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          value={dataset.label}
                          onChange={(e) => updateDatasetLabel(datasetIndex, e.target.value)}
                          placeholder="Dataset name"
                          className="flex-1"
                        />
                        <input
                          type="color"
                          value={dataset.backgroundColor || defaultColors[datasetIndex % defaultColors.length]}
                          onChange={(e) => updateDatasetColor(datasetIndex, e.target.value)}
                          className="w-8 h-8 rounded border cursor-pointer"
                          title="Choose color"
                        />
                        {chartData.datasets.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeDataset(datasetIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Data values */}
                      <div className="grid grid-cols-2 gap-2">
                        {dataset.data.map((value, dataIndex) => (
                          <div key={dataIndex} className="flex gap-1">
                            <Input
                              type="number"
                              value={value}
                              onChange={(e) => updateDatasetData(datasetIndex, dataIndex, Number(e.target.value))}
                              className="text-sm"
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Live Preview */}
        {showPreview && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-white">
                  {renderChart()}
                </div>
                {description && (
                  <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded">
                    {description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                                     onClick={() => {
                     setChartData({
                       labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                       datasets: [{
                         label: 'Sample Data',
                         data: [65, 59, 80, 81],
                         backgroundColor: defaultColors[0],
                         borderColor: defaultColors[0],
                         borderWidth: 2
                       }]
                     });
                     setTitle('Sample Chart');
                     setDescription('A sample chart for demonstration');
                     setXAxisTitle('Quarters');
                     setYAxisTitle('Value');
                   }}
                >
                  Reset to Sample
                </Button>
                                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   className="w-full"
                                      onClick={() => {
                      setChartData({
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                          label: 'Revenue',
                          data: [12, 19, 3, 5, 2, 3],
                          backgroundColor: defaultColors[1],
                          borderColor: defaultColors[1],
                          borderWidth: 2
                        }]
                      });
                      setTitle('Revenue Chart');
                      setDescription('Monthly revenue overview');
                      setXAxisTitle('Months');
                      setYAxisTitle('Revenue ($)');
                    }}
                 >
                   Load Revenue Template
                 </Button>
                 
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   className="w-full"
                   onClick={() => {
                     setChartData({
                       labels: ['8%', '10%', '12%', '14%', '16%', '18%', '20%'],
                       datasets: [{
                         label: 'Company Value',
                         data: [120, 100, 85, 72, 62, 54, 47],
                         backgroundColor: defaultColors[2],
                         borderColor: defaultColors[2],
                         borderWidth: 2
                       }]
                     });
                     setTitle('Discount Rate vs Company Value');
                     setDescription('Shows the inverse relationship between discount rates and company valuations');
                     setXAxisTitle('Discount Rate');
                     setYAxisTitle('Company Value ($B)');
                   }}
                 >
                   Load Discount Rate Template
                 </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
