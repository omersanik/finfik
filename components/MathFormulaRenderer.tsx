"use client";

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
    console.log("MathFormulaRenderer: useEffect triggered");
    console.log("MathFormulaRenderer: Rendering formula:", formula);
    console.log("MathFormulaRenderer: Display mode:", display);
    console.log("MathFormulaRenderer: Element ref:", elementRef.current);
    
    if (elementRef.current && formula) {
      try {
        // Clear any existing content first
        elementRef.current.innerHTML = '';
        console.log("MathFormulaRenderer: Cleared element content");
        
        katex.render(formula, elementRef.current, {
          displayMode: display === 'block',
          throwOnError: false,
          errorColor: '#cc0000',
        });
        console.log("MathFormulaRenderer: Successfully rendered formula");
        console.log("MathFormulaRenderer: Final element HTML:", elementRef.current.innerHTML);
      } catch (error) {
        console.error('KaTeX rendering error:', error);
        // Do not render the formula as plain text if KaTeX fails
      }
    } else {
      console.log("MathFormulaRenderer: Element ref or formula not available");
    }
  }, [formula, display]);

  console.log("MathFormulaRenderer: Component rendering with formula:", formula);

  return (
    <span 
      ref={elementRef} 
      className={`math-formula ${display === 'block' ? 'block my-4' : 'inline'} ${className}`}
      data-debug="math-formula-renderer"
      data-formula={formula}
    />
  );
} 