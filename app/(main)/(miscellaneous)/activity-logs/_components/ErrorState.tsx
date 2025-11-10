const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex flex-col items-center justify-center h-full text-destructive">
    <p>{message}</p>
    <button
      onClick={onRetry}
      className="mt-2 text-sm underline hover:no-underline"
    >
      Retry
    </button>
  </div>
);

export default ErrorState;
