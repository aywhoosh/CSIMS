"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"

const OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
  { label: "60 days", value: 60 },
  { label: "90 days", value: 90 },
]

export function DaysSelector({ current }: { current: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setDays = useCallback(
    (days: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("days", days.toString())
      router.push(`/insights?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      {OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={current === opt.value ? "default" : "ghost"}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => setDays(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
