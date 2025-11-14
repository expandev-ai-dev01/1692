export interface ErrorMessageProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
}
