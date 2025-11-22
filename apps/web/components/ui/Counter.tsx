'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface CounterProps {
  value: number | string;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

export function Counter({ 
  value, 
  suffix = '', 
  prefix = '', 
  duration = 2000,
  decimals = 0,
  className = ''
}: CounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Parse value - handle strings like "2.5M+" or "500+"
  const parseValue = (val: number | string): number => {
    if (typeof val === 'number') return val;
    
    const str = val.toString();
    
    // Handle M (million) - e.g., "2.5M+" or "2.5M"
    if (str.includes('M')) {
      const numStr = str.replace(/[M+]/g, '');
      const num = parseFloat(numStr);
      return isNaN(num) ? 0 : num * 1000000;
    }
    
    // Handle K (thousand) - e.g., "1.2K+" or "1.2K"
    if (str.includes('K')) {
      const numStr = str.replace(/[K+]/g, '');
      const num = parseFloat(numStr);
      return isNaN(num) ? 0 : num * 1000;
    }
    
    // Handle regular numbers with + - e.g., "500+" or "1200+"
    const cleaned = str.replace(/[+,]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const targetValue = useMemo(() => parseValue(value), [value]);
  const hasDecimal = useMemo(() => targetValue % 1 !== 0, [targetValue]);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeOutCubic;
      
      setCount(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, targetValue, duration]);

  const formatNumber = (num: number, originalValue: number | string): string => {
    const originalStr = typeof originalValue === 'string' ? originalValue : '';
    const hasPlus = originalStr.includes('+');
    const hasM = originalStr.includes('M');
    const hasK = originalStr.includes('K');
    
    // If original had decimals and we want to show them
    if (hasDecimal && decimals > 0) {
      const formatted = num.toFixed(decimals);
      return hasPlus ? `${formatted}+` : formatted;
    }
    
    // Format large numbers
    if (num >= 1000000 || hasM) {
      const millions = num / 1000000;
      const formatted = millions.toFixed(1);
      return hasPlus ? `${formatted}M+` : `${formatted}M`;
    }
    if (num >= 1000 || hasK) {
      const thousands = num / 1000;
      const formatted = thousands.toFixed(1);
      return hasPlus ? `${formatted}K+` : `${formatted}K`;
    }
    
    const formatted = Math.floor(num).toString();
    return hasPlus ? `${formatted}+` : formatted;
  };

  const displayValue = formatNumber(count, value);

  return (
    <div ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </div>
  );
}

