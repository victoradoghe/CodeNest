import type { ReactNode } from "react";

/**
 * A deliberately small markdown renderer for lesson copy.
 *
 * Supports exactly what the course content uses: `### headings`, paragraphs,
 * bullet/numbered lists, pipe tables, fenced code blocks, and the inline set
 * (**bold**, *italic*, `code`, [links](url)).
 *
 * It emits React elements rather than an HTML string, so there is no
 * dangerouslySetInnerHTML anywhere and content cannot inject markup.
 */

let keySeed = 0;
const nextKey = () => `md-${keySeed++}`;

/** Inline formatting: `code`, **bold**, *italic*, [text](href). */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Ordered so that `code` wins over everything inside it.
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(<code key={nextKey()}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={nextKey()} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(<em key={nextKey()}>{token.slice(1, -1)}</em>);
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        // Only allow safe schemes — no javascript: URLs.
        const safe = /^(https?:|\/|#)/.test(href) ? href : "#";
        nodes.push(
          <a
            key={nextKey()}
            href={safe}
            {...(safe.startsWith("http")
              ? { target: "_blank", rel: "noreferrer noopener" }
              : {})}
          >
            {label}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function Table({ rows }: { rows: string[][] }) {
  const [head, ...body] = rows;
  return (
    <div className="my-5 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-surface-2">
          <tr>
            {head.map((cell, i) => (
              <th
                key={i}
                className="border-b border-border px-3 py-2 text-left font-semibold"
              >
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className="border-b border-border last:border-0">
              {row.map((cell, c) => (
                <td key={c} className="px-3 py-2 align-top">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const isDivider = (line: string) => /^\|?[\s:|-]+\|[\s:|-]*$/.test(line.trim());

/**
 * Inline-only rendering, for places where a block element would be invalid
 * HTML — inside a <legend>, <p>, <button> or heading.
 */
export function MarkdownInline({ children }: { children: string }) {
  return <>{renderInline(children)}</>;
}

export function Markdown({ children }: { children: string }) {
  const lines = children.split("\n");
  const blocks: ReactNode[] = [];

  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(<p key={nextKey()}>{renderInline(paragraph.join(" "))}</p>);
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith("```")) {
      flushParagraph();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      blocks.push(
        <pre
          key={nextKey()}
          className="my-4 overflow-x-auto rounded-lg border border-border bg-surface-2 p-3 font-mono text-[13px] leading-relaxed"
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Heading
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push(<h3 key={nextKey()}>{renderInline(trimmed.slice(4))}</h3>);
      continue;
    }

    // Table — a pipe row followed by a |---|---| divider
    if (
      trimmed.startsWith("|") &&
      i + 1 < lines.length &&
      isDivider(lines[i + 1])
    ) {
      flushParagraph();
      const rows: string[][] = [splitRow(trimmed)];
      i += 2; // skip the divider
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      i--;
      blocks.push(<Table key={nextKey()} rows={rows} />);
      continue;
    }

    // Lists
    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    const numbered = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        const b = /^[-*]\s+(.*)$/.exec(t);
        const n = /^\d+\.\s+(.*)$/.exec(t);
        if (ordered && n) items.push(n[1]);
        else if (!ordered && b) items.push(b[1]);
        else break;
        i++;
      }
      i--;
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={nextKey()}>
          {items.map((item) => (
            <li key={nextKey()}>{renderInline(item)}</li>
          ))}
        </List>,
      );
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();

  return <div className="prose-block">{blocks}</div>;
}
