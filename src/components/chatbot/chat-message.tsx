"use client"

import { type UIMessage } from "ai"
import { cn } from "@/lib/utils"
import { Bot, User, Wrench } from "lucide-react"

interface ChatMessageProps {
  message: UIMessage
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  // Collect tool invocation labels (shown as "thinking" indicators)
  // In AI SDK v6, tool parts have type "tool-{toolName}" (e.g. "tool-get_low_stock_items")
  const toolCalls =
    message.parts
      ?.filter((part: { type: string }) => part.type.startsWith("tool-"))
      .map((part: any) => (part.toolName ?? part.type.replace(/^tool-/, "")).replace(/_/g, " ")) ?? []

  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted border"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-primary" />
        )}
      </div>

      <div className={cn("flex flex-col gap-1.5 max-w-[85%]", isUser && "items-end")}>
        {/* Tool calls indicator */}
        {isAssistant && toolCalls.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {toolCalls.map((name: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
              >
                <Wrench className="h-2.5 w-2.5" />
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Message bubble */}
        {(() => {
          const textContent = message.parts
            ?.filter((p: { type: string }) => p.type === "text")
            .map((p: any) => p.text)
            .join("") || ""

          // Fallback: if tools were used but no text was generated, nudge user to retry
          if (!textContent && isAssistant && toolCalls.length > 0) {
            return (
              <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed bg-muted rounded-tl-sm text-muted-foreground italic">
                Response unavailable — please try again.
              </div>
            )
          }

          return textContent ? (
            <div
              className={cn(
                "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                isUser
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted rounded-tl-sm"
              )}
            >
              <MessageContent content={textContent} />
            </div>
          ) : null
        })()}
      </div>
    </div>
  )
}

/** Renders markdown-lite: bold, bullet lists, and line breaks */
function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />

        // Bullet list items
        if (line.trimStart().startsWith("- ") || line.trimStart().startsWith("• ")) {
          const text = line.replace(/^[\s\-•]+/, "")
          return (
            <div key={i} className="flex gap-1.5">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-current flex-shrink-0 opacity-60" />
              <span>{renderInline(text)}</span>
            </div>
          )
        }

        // Numbered list items
        if (/^\d+\.\s/.test(line.trimStart())) {
          const match = line.match(/^(\d+)\.\s(.*)/)
          if (match) {
            return (
              <div key={i} className="flex gap-1.5">
                <span className="flex-shrink-0 opacity-60">{match[1]}.</span>
                <span>{renderInline(match[2])}</span>
              </div>
            )
          }
        }

        // Heading (##)
        if (line.startsWith("## ")) {
          return (
            <p key={i} className="font-semibold text-sm mt-2">
              {line.slice(3)}
            </p>
          )
        }

        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function renderInline(text: string) {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}
