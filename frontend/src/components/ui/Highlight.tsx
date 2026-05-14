interface HighlightProps {
  text: string;
  keyword: string;
}

export function Highlight({ text, keyword }: HighlightProps) {
  if (!keyword || !text) return <>{text}</>;

  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200/70 dark:bg-yellow-800/50 text-inherit rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
