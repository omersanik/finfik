"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic imports for heavy components
export const DynamicChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  {
    loading: () => <Skeleton className="w-full h-64" />,
    ssr: false,
  }
);

export const DynamicEditor = dynamic(
  () => import('@/components/Editor').then((mod) => mod.default),
  {
    loading: () => <Skeleton className="w-full h-96" />,
    ssr: false,
  }
);

export const DynamicMathRenderer = dynamic(
  () => import('react-katex').then((mod) => mod.default),
  {
    loading: () => <Skeleton className="w-32 h-8" />,
    ssr: false,
  }
);

export const DynamicLottie = dynamic(
  () => import('lottie-react').then((mod) => mod.default),
  {
    loading: () => <Skeleton className="w-32 h-32 rounded-full" />,
    ssr: false,
  }
);
