import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={[
        'animate-pulse rounded-xl bg-surface-muted/60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

