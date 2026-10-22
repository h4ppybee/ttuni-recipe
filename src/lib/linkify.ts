export type LinkPart = { type: 'text'; value: string } | { type: 'link'; value: string; href: string };

const URL_PATTERN =
  /https?:\/\/[^\s<>"'ᄀ-ᇿ‘-‟…　-〿㄰-㆏가-힣＀-￯]+/g;
// ᄀ-ᇿ: 한글 자모(Hangul Jamo)
// ‘-‟: iOS 스마트 따옴표(‘ ’ ‚ ‛ “ ” „ ‟)
// …: 말줄임표(…)
// 　-〿: CJK 기호·구두점(전각 공백, 「」등 포함)
// ㄰-㆏: 한글 호환 자모
// 가-힣: 한글 완성형 음절(가-힣)
// ＀-￯: 전각 문자(＀-￯)
const TRAILING = '.,!?;:)]}\'"';

function schemePrefixLength(raw: string): number {
  if (raw.startsWith('https://')) {
    return 'https://'.length;
  }
  return 'http://'.length;
}

function count(text: string, ch: string): number {
  return text.split(ch).length - 1;
}

function trimUrl(raw: string): string {
  let url = raw;
  while (url.length > 0) {
    const last = url[url.length - 1];
    if (!TRAILING.includes(last)) {
      break;
    }
    if (last === ')' && count(url, '(') >= count(url, ')')) {
      break;
    }
    url = url.slice(0, -1);
  }
  return url;
}

export function linkify(text: string): LinkPart[] {
  const parts: LinkPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const url = trimUrl(match[0]);
    if (url.length <= schemePrefixLength(match[0])) {
      continue;
    }
    if (start > cursor) {
      parts.push({ type: 'text', value: text.slice(cursor, start) });
    }
    parts.push({ type: 'link', value: url, href: url });
    cursor = start + url.length;
  }
  if (cursor < text.length) {
    parts.push({ type: 'text', value: text.slice(cursor) });
  }
  return parts;
}
