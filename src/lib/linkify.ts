export type LinkPart = { type: 'text'; value: string } | { type: 'link'; value: string; href: string };

// URL에 바로 붙어 오는 아래 문자는 링크에서 뺀다.
// \u1100-\u11FF 한글 자모, \u2018-\u201F iOS 둥근 따옴표, \u2026 말줄임표,
// \u3000-\u303F CJK 기호·문장부호(전각 공백, 「」 등), \u3130-\u318F 한글 호환 자모,
// \uAC00-\uD7A3 한글 음절, \uFF00-\uFFEF 전각 문자
const URL_PATTERN =
  /https?:\/\/[^\s<>"'\u1100-\u11FF\u2018-\u201F\u2026\u3000-\u303F\u3130-\u318F\uAC00-\uD7A3\uFF00-\uFFEF]+/g;
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
