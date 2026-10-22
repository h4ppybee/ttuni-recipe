import { useRouteError } from 'react-router';
import { EmptyState } from './ui/EmptyState';

function describe(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

export function RouteError() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="mx-auto max-w-[480px] px-4">
      <EmptyState
        message="문제가 생겨서 화면을 보여주지 못했어요. 다시 시도해 주세요."
        actionLabel="다시 시도하기"
        onAction={() => window.location.reload()}
      />
      <p className="break-words text-center text-caption text-muted">{describe(error)}</p>
    </div>
  );
}
