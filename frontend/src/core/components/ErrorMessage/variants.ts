import { clsx } from 'clsx';

export interface ErrorMessageVariantProps {
  className?: string;
}

export function getErrorMessageClassName(props: ErrorMessageVariantProps): string {
  const { className } = props;

  return clsx('flex items-center justify-center min-h-screen p-4', className);
}
