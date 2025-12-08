"use client";

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function AureliaMessage({ text, className }: { text: string; className?: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setDisplayedText('');
    let i = 0;
    
    // Start a new interval
    intervalRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text[i]);
        i++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 25); // typing speed

    // Cleanup on component unmount or text change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text]);

  return (
    <div className={cn("bg-black/40 p-4 sm:p-6 rounded-lg border-2 border-primary/20 shadow-inner shadow-black/50 animate-fade-in", className)}>
      <p className="font-code text-primary text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
        <span className="text-accent font-bold">&gt; AURELIA:</span> {displayedText}
        <span className="animate-pulse ml-1">▋</span>
      </p>
    </div>
  );
}
