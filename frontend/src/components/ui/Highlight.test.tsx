import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Highlight } from './Highlight';

describe('Highlight', () => {
  it('renders text without highlight when keyword is empty', () => {
    render(<Highlight text="Hello World" keyword="" />);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('highlights matching keyword', () => {
    const { container } = render(<Highlight text="Hello World" keyword="World" />);
    const mark = container.querySelector('mark');
    expect(mark?.textContent).toBe('World');
  });

  it('is case insensitive', () => {
    const { container } = render(<Highlight text="Hello World" keyword="world" />);
    const mark = container.querySelector('mark');
    expect(mark?.textContent).toBe('World');
  });

  it('highlights multiple matches', () => {
    const { container } = render(<Highlight text="abc abc abc" keyword="abc" />);
    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBe(3);
  });

  it('handles special regex characters in keyword', () => {
    const { container } = render(<Highlight text="Price: $100" keyword="$100" />);
    const mark = container.querySelector('mark');
    expect(mark?.textContent).toBe('$100');
  });
});
