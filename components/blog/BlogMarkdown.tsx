import type { ReactNode } from "react";

function inlineMarkdown(value: string, keyPrefix: string): ReactNode[] {
  const tokens = /(!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_)/g;
  const result: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = tokens.exec(value))) {
    if (match.index > cursor) result.push(value.slice(cursor, match.index));
    if (match[1]) result.push(<img key={`${keyPrefix}-img-${index}`} src={match[3]} alt={match[2] || "Imagen del artículo"} loading="lazy" decoding="async" />);
    else if (match[4]) {
      const external = /^https?:\/\//i.test(match[5]);
      result.push(<a key={`${keyPrefix}-link-${index}`} href={match[5]} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{match[4]}</a>);
    } else if (match[6]) result.push(<code key={`${keyPrefix}-code-${index}`}>{match[6]}</code>);
    else if (match[7] || match[8]) result.push(<strong key={`${keyPrefix}-strong-${index}`}>{match[7] || match[8]}</strong>);
    else result.push(<em key={`${keyPrefix}-em-${index}`}>{match[9] || match[10]}</em>);
    cursor = match.index + match[0].length;
    index += 1;
  }
  if (cursor < value.length) result.push(value.slice(cursor));
  return result;
}

function markdownBlocks(content: string): ReactNode[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let ordered = false;
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(<p key={`p-${blocks.length}`}>{inlineMarkdown(paragraph.join(" "), `p-${blocks.length}`)}</p>);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (!list.length) return;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(<Tag key={`list-${blocks.length}`}>{list.map((item, index) => <li key={index}>{inlineMarkdown(item, `li-${blocks.length}-${index}`)}</li>)}</Tag>);
    list = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();
      if (code) {
        blocks.push(<pre key={`code-${index}`}><code>{code.join("\n")}</code></pre>);
        code = null;
      } else {
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const Tag = `h${heading[1].length}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      blocks.push(<Tag key={`h-${index}`}>{inlineMarkdown(heading[2], `h-${index}`)}</Tag>);
      continue;
    }

    const listItem = line.match(/^\s*(?:[-*+]|(\d+)\.)\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      const nextOrdered = Boolean(listItem[1]);
      if (list.length && nextOrdered !== ordered) flushList();
      ordered = nextOrdered;
      list.push(listItem[2]);
      continue;
    }

    if (line.trim().startsWith(">")) {
      flushParagraph();
      flushList();
      blocks.push(<blockquote key={`quote-${index}`}>{inlineMarkdown(line.replace(/^\s*>\s?/, ""), `quote-${index}`)}</blockquote>);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  if (code) blocks.push(<pre key="code-last"><code>{code.join("\n")}</code></pre>);
  return blocks;
}

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className="blog-prose max-w-none">
      {markdownBlocks(content)}
    </div>
  );
}
