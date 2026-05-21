import { streamText, convertToModelMessages } from "ai"
import { google } from "@ai-sdk/google"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { buildTools } from "@/lib/chatbot/tools"
import { buildSystemPrompt } from "@/lib/chatbot/system-prompt"

export const maxDuration = 60

export async function POST(request: Request) {
  // Auth guard
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Load user profile for context injection into the system prompt
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, sites(name)")
    .eq("id", user.id)
    .single()

  const { messages } = await request.json()

  if (!Array.isArray(messages)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const systemPrompt = buildSystemPrompt({
    full_name: profile?.full_name || user.email || "User",
    role: profile?.role || "store_keeper",
    site_name: (profile?.sites as any)?.name || "All Sites",
  })

  const result = streamText({
    model: google("gemini-3.1-flash-lite-preview"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: buildTools(supabase),
    maxSteps: 5,
    temperature: 0.3,
    prepareStep: ({ stepNumber }) => {
      if (stepNumber > 0) {
        // After tool calls, force text-only generation so the lite model
        // doesn't silently finish without producing a written response.
        return {
          toolChoice: "none" as const,
          system:
            systemPrompt +
            "\n\nYou have just received the tool results above. " +
            "Now write your response in plain text. Do not call any more tools.",
        }
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
