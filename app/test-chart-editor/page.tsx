"use client";

import SimpleChartEditor from '@/components/admin/SimpleChartEditor';
import { useState } from 'react';

export default function TestChartEditor() {
  const [chartData, setChartData] = useState('');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chart Editor Demo</h1>
        <p className="text-gray-600">
          Test the new simplified chart editor with live preview. This makes it much easier for admins to create charts!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Editor */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Chart Editor</h2>
          <SimpleChartEditor
            value={chartData}
            onChange={setChartData}
            placeholder="Start creating your chart..."
          />
        </div>

        {/* JSON Output */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Generated JSON</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-96">
              {chartData || 'No chart data yet...'}
            </pre>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Live preview as you type</li>
              <li>✅ Simple form inputs (no complex JSON editing)</li>
              <li>✅ Color picker for datasets</li>
              <li>✅ Easy add/remove labels and datasets</li>
              <li>✅ Quick templates (Sample, Revenue)</li>
              <li>✅ Toggle preview on/off</li>
              <li>✅ Responsive design</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
