import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="暂无数据" />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="暂无数据" description="这里什么都没有" />);
    expect(screen.getByText('这里什么都没有')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<EmptyState title="暂无数据" />);
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<EmptyState title="暂无数据" action={<button>刷新</button>} />);
    expect(screen.getByText('刷新')).toBeInTheDocument();
  });
});
