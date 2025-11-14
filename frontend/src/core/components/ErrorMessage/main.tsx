import { getErrorMessageClassName } from './variants';
import type { ErrorMessageProps } from './types';

/**
 * @component ErrorMessage
 * @summary Error message display component with optional retry action.
 * @domain core
 * @type ui-component
 * @category feedback
 */
export const ErrorMessage = (props: ErrorMessageProps) => {
  const { title, message, onRetry, onBack, className } = props;

  return (
    <div className={getErrorMessageClassName({ className })}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex gap-4 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
