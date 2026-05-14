import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog open={false} title="Test" message="Msg" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders title and message when open', () => {
    render(
      <ConfirmDialog open={true} title="确认删除" message="此操作不可恢复" onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText('确认删除')).toBeTruthy();
    expect(screen.getByText('此操作不可恢复')).toBeTruthy();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByText('确认'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog open={true} title="Test" message="Msg" onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByText('取消'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows danger icon when danger is true', () => {
    const { container } = render(
      <ConfirmDialog open={true} title="Test" message="Msg" danger onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
