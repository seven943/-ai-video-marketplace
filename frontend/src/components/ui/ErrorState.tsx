import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = '加载失败，请稍后重试', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 btn-secondary text-sm gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          重试
        </button>
      )}
    </div>
  );
}
