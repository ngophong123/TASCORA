import * as React from "react"

/** A deliberately small, text-only Markdown subset. HTML remains escaped React text. */
function inlineText(value: string): React.ReactNode {
  return value.split(/(\*\*[^*\n]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold text-[var(--foreground)]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  )
}

type Block = {
  kind: "paragraph" | "heading" | "list"
  lines: string[]
  level?: number
  ordered?: boolean
}

export function ServiceDescription({ text }: { text: string }) {
  const blocks: Block[] = []
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    if (!line.trim()) {
      // A blank line separates adjacent paragraphs or lists.
      blocks.push({ kind: "paragraph", lines: [] })
      continue
    }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/)
    const bullet = line.match(/^\s*(?:[-*+]\s+|\d+[.)]\s+)(.+)$/)
    if (heading) {
      blocks.push({ kind: "heading", lines: [heading[2]!], level: Math.max(3, heading[1]!.length) })
    } else if (bullet) {
      const ordered = /^\s*\d+[.)]/.test(line)
      const previous = blocks[blocks.length - 1]
      if (previous?.kind === "list" && previous.ordered === ordered) previous.lines.push(bullet[1]!)
      else blocks.push({ kind: "list", lines: [bullet[1]!], ordered })
    } else {
      const previous = blocks[blocks.length - 1]
      if (previous?.kind === "paragraph") previous.lines.push(line)
      else blocks.push({ kind: "paragraph", lines: [line] })
    }
  }

  return (
    <div className="space-y-4 text-base leading-relaxed text-[var(--text-secondary)]">
      {blocks
        .filter((block) => block.lines.length > 0)
        .map((block, index) => {
          if (block.kind === "heading") {
            const Heading = `h${block.level}` as "h3" | "h4" | "h5" | "h6"
            return (
              <Heading key={index} className="pt-2 text-lg font-medium text-[var(--foreground)]">
                {inlineText(block.lines[0]!)}
              </Heading>
            )
          }
          if (block.kind === "list") {
            const List = block.ordered ? "ol" : "ul"
            return (
              <List
                key={index}
                className={
                  block.ordered ? "list-decimal space-y-2 pl-5" : "list-disc space-y-2 pl-5"
                }
              >
                {block.lines.map((line, item) => (
                  <li key={item}>{inlineText(line)}</li>
                ))}
              </List>
            )
          }
          return (
            <p key={index} className="whitespace-pre-line">
              {inlineText(block.lines.join("\n"))}
            </p>
          )
        })}
    </div>
  )
}
