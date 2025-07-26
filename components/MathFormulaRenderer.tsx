"use client";

import { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathFormulaRendererProps {
  formula: string;
  display?: 'inline' | 'block';
  className?: string;
}

export default function MathFormulaRenderer({ 
  formula, 
  display = 'inline', 
  className = '' 
}: MathFormulaRendererProps) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (elementRef.current && formula) {
      try {
        katex.render(formula, elementRef.current, {
          displayMode: display === 'block',
          throwOnError: false,
          errorColor: '#cc0000',
        });
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        elementRef.current.textContent = formula;
      }
    }
  }, [formula, display]);

  return (
    <span 
      ref={elementRef} 
      className={`math-formula ${display === 'block' ? 'block my-4' : 'inline'} ${className}`}
    />
  );
} 