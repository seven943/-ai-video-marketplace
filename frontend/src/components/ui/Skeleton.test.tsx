import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton, WorkCardSkeleton, CreatorCardSkeleton, OrderCardSkeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders with default classes', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('animate-pulse');
    expect(el.className).toContain('bg-gray-200');
  });

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-20" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('h-10 w-20');
  });
});

describe('WorkCardSkeleton', () => {
  it('renders skeleton structure', () => {
    const { container } = render(<WorkCardSkeleton />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('CreatorCardSkeleton', () => {
  it('renders skeleton structure', () => {
    const { container } = render(<CreatorCardSkeleton />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('OrderCardSkeleton', () => {
  it('renders skeleton structure', () => {
    const { container } = render(<OrderCardSkeleton />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});
