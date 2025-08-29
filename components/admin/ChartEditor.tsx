"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  BarChart3,
  LineChart,
  PieChart,
  Palette,
  Settings,
} from "lucide-react";

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
  type: "line" | "bar" | "pie";
  title: string;
  description: string;
  data: ChartData;
  yAxis?: {
    title?: string;
    min?: number;
    max?: number;
    stepSize?: number;
  };
}

interface ChartEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const chartTypes = [
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "pie", label: "Pie Chart", icon: PieChart },
];

const defaultColors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#FF6384",
  "#C9CBCF",
];

const defaultChartConfig: ChartConfig = {
  type: "line",
  title: "",
  description: "",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Sample Data",
        data: [12, 19, 3, 5, 2],
        backgroundColor: defaultColors[0],
        borderColor: defaultColors[0],
        borderWidth: 2,
      },
    ],
  },
  yAxis: {
    title: "Value",
    min: 0,
    max: 25,
    stepSize: 5,
  },
};

export default function ChartEditor({ value, onChange }: ChartEditorProps) {
  const [chartType, setChartType] = useState("line");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chartData, setChartData] = useState<ChartData>(
    defaultChartConfig.data
  );
  const [yAxisTitle, setYAxisTitle] = useState("Value");
  const [yAxisMin, setYAxisMin] = useState(0);
  const [yAxisMax, setYAxisMax] = useState(25);
  const [yAxisStepSize, setYAxisStepSize] = useState(5);
  const [initialized, setInitialized] = useState(false);

  // Initialize with existing data or defaults
  useEffect(() => {
    if (!initialized) {
      if (value && value.trim() !== "") {
        try {
          const parsed = JSON.parse(value);
          setChartType(parsed.type || "line");
          setTitle(parsed.title || "");
          setDescription(parsed.description || "");
          setChartData(parsed.data || defaultChartConfig.data);

          // Set Y-axis values
          if (parsed.yAxis) {
            setYAxisTitle(parsed.yAxis.title || "Value");
            setYAxisMin(parsed.yAxis.min || 0);
            setYAxisMax(parsed.yAxis.max || 25);
            setYAxisStepSize(parsed.yAxis.stepSize || 5);
          }
        } catch (e) {
          console.log(
            `Could not parse existing chart data, using defaults ${e}`
          );
          setChartType("line");
          setTitle("");
          setDescription("");
          setChartData(defaultChartConfig.data);
          setYAxisTitle("Value");
          setYAxisMin(0);
          setYAxisMax(25);
          setYAxisStepSize(5);
        }
      } else {
        // No existing value, use defaults
        setChartType("line");
        setTitle("");
        setDescription("");
        setChartData(defaultChartConfig.data);
        setYAxisTitle("Value");
        setYAxisMin(0);
        setYAxisMax(25);
        setYAxisStepSize(5);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Save changes to parent
  const saveChanges = () => {
    const chartConfig: ChartConfig = {
      type: chartType as "line" | "bar" | "pie",
      title,
      description,
      data: chartData,
      yAxis: {
        title: yAxisTitle,
        min: yAxisMin,
        max: yAxisMax,
        stepSize: yAxisStepSize,
      },
    };
    onChange(JSON.stringify(chartConfig, null, 2));
  };

  // Save whenever any value changes
  useEffect(() => {
    if (initialized) {
      saveChanges();
    }
  }, [
    chartType,
    title,
    description,
    chartData,
    yAxisTitle,
    yAxisMin,
    yAxisMax,
    yAxisStepSize,
    initialized,
    saveChanges,
  ]);

  const addDataset = () => {
    const newDatasetIndex = chartData.datasets.length;
    setChartData((prev) => ({
      ...prev,
      datasets: [
        ...prev.datasets,
        {
          label: `Dataset ${newDatasetIndex + 1}`,
          data: Array(prev.labels.length).fill(0),
          backgroundColor:
            defaultColors[newDatasetIndex % defaultColors.length],
          borderColor: defaultColors[newDatasetIndex % defaultColors.length],
          borderWidth: 2,
        },
      ],
    }));
  };

  const removeDataset = (index: number) => {
    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.filter((_, i) => i !== index),
    }));
  };

  const updateLabel = (index: number, value: string) => {
    setChartData((prev) => ({
      ...prev,
      labels: prev.labels.map((label, i) => (i === index ? value : label)),
    }));
  };

  const updateDatasetData = (
    datasetIndex: number,
    dataIndex: number,
    value: number
  ) => {
    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) =>
        i === datasetIndex
          ? {
              ...dataset,
              data: dataset.data.map((d, j) => (j === dataIndex ? value : d)),
            }
          : dataset
      ),
    }));
  };

  const updateDatasetLabel = (index: number, value: string) => {
    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) =>
        i === index ? { ...dataset, label: value } : dataset
      ),
    }));
  };

  const updateDatasetColor = (index: number, color: string) => {
    setChartData((prev) => ({
      ...prev,
      datasets: prev.datasets.map((dataset, i) =>
        i === index
          ? {
              ...dataset,
              backgroundColor: color,
              borderColor: color,
            }
          : dataset
      ),
    }));
  };

  const addLabel = () => {
    setChartData((prev) => ({
      ...prev,
      labels: [...prev.labels, `Label ${prev.labels.length + 1}`],
      datasets: prev.datasets.map((dataset) => ({
        ...dataset,
        data: [...dataset.data, 0],
      })),
    }));
  };

  const removeLabel = (index: number) => {
    setChartData((prev) => ({
      ...prev,
      labels: prev.labels.filter((_, i) => i !== index),
      datasets: prev.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.filter((_, i) => i !== index),
      })),
    }));
  };

  if (!initialized) {
    return <div>Loading chart editor...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chart Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chart Type */}
          <div>
            <Label>Chart Type</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((type) => {
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

          {/* Title */}
          <div>
            <Label>Chart Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter chart title"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter chart description"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Y-Axis Configuration */}
      {chartType !== "pie" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Y-Axis Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Y-Axis Title</Label>
                <Input
                  value={yAxisTitle}
                  onChange={(e) => setYAxisTitle(e.target.value)}
                  placeholder="e.g., Sales, Revenue, Count"
                />
              </div>
              <div>
                <Label>Step Size</Label>
                <Input
                  type="number"
                  value={yAxisStepSize}
                  onChange={(e) => setYAxisStepSize(Number(e.target.value))}
                  placeholder="5"
                  min="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Value</Label>
                <Input
                  type="number"
                  value={yAxisMin}
                  onChange={(e) => setYAxisMin(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Maximum Value</Label>
                <Input
                  type="number"
                  value={yAxisMax}
                  onChange={(e) => setYAxisMax(Number(e.target.value))}
                  placeholder="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Configuration</CardTitle>
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
            <div className="grid grid-cols-5 gap-2">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex gap-1">
                  <Input
                    value={label}
                    onChange={(e) => updateLabel(index, e.target.value)}
                    className="text-sm"
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
                <div key={datasetIndex} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={dataset.label}
                      onChange={(e) =>
                        updateDatasetLabel(datasetIndex, e.target.value)
                      }
                      placeholder="Dataset name"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">Color:</Label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={dataset.backgroundColor || "#FF6384"}
                          onChange={(e) =>
                            updateDatasetColor(datasetIndex, e.target.value)
                          }
                          className="w-8 h-8 rounded border cursor-pointer"
                          title="Choose color"
                        />
                        <Palette className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
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
                  <div className="grid grid-cols-5 gap-2">
                    {dataset.data.map((value, dataIndex) => (
                      <Input
                        key={dataIndex}
                        type="number"
                        value={value}
                        onChange={(e) =>
                          updateDatasetData(
                            datasetIndex,
                            dataIndex,
                            Number(e.target.value)
                          )
                        }
                        className="text-sm"
                        placeholder="0"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-2">
              {title || "Chart Title"}
            </div>
            <div className="text-xs text-gray-500">
              {description || "Chart description will appear here"}
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Chart preview will be rendered in the course content
            </div>
            {/* Y-axis info */}
            {chartType !== "pie" && (
              <div className="mt-2 text-xs text-gray-500">
                Y-axis: {yAxisTitle} ({yAxisMin} - {yAxisMax}, step:{" "}
                {yAxisStepSize})
              </div>
            )}
            {/* Color preview */}
            <div className="mt-3 flex justify-center gap-2">
              {chartData.datasets.map((dataset, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor: dataset.backgroundColor || "#FF6384",
                    }}
                  />
                  <span className="text-xs text-gray-500">{dataset.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
