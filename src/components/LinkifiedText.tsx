import { linkify } from '../lib/linkify';

export function LinkifiedText({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-body-md text-body-soft">
      {linkify(text).map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.value}</span>;
        }
        return (
          <a key={index} href={part.href} target="_blank" rel="noopener noreferrer" className="text-primary-text underline underline-offset-2">
            {part.value}
          </a>
        );
      })}
    </p>
  );
}
