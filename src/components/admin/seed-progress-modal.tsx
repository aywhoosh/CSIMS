"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Circle, CircleCheck, CircleX, Database, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  seedStep_BaseData,
  seedStep_PurchaseOrders,
  seedStep_Transactions,
  seedStep_InvoicesPayments,
  seedStep_Audits,
  seedStep_Finalize,
} from "@/lib/actions/admin"

type StepStatus = "pending" | "running" | "complete" | "error"

const SEED_STEPS = [
  { label: "Base Data", description: "Categories, sites, storage locations, suppliers & items", action: seedStep_BaseData },
  { label: "Purchase Orders", description: "Orders and line items", action: seedStep_PurchaseOrders },
  { label: "Transactions", description: "Inward & outward inventory movements", action: seedStep_Transactions },
  { label: "Invoices & Payments", description: "Supplier invoices and payment records", action: seedStep_InvoicesPayments },
  { label: "Stock Audits", description: "Audit records and item counts", action: seedStep_Audits },
  { label: "Finalizing", description: "Correcting calculated values", action: seedStep_Finalize },
]

interface SeedProgressModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: () => void
}

export function SeedProgressModal({ open, onOpenChange, onComplete }: SeedProgressModalProps) {
  const router = useRouter()
  const [statuses, setStatuses] = useState<StepStatus[]>(() => SEED_STEPS.map(() => "pending"))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const isRunningRef = useRef(false)

  const completedCount = statuses.filter((s) => s === "complete").length
  const progressPercent = (completedCount / SEED_STEPS.length) * 100

  const runSteps = useCallback(async (startFrom = 0) => {
    if (isRunningRef.current) return
    isRunningRef.current = true
    setErrorMessage(null)

    // Reset statuses from startFrom onwards
    setStatuses((prev) =>
      prev.map((s, i) => (i < startFrom ? s : "pending"))
    )

    for (let i = startFrom; i < SEED_STEPS.length; i++) {
      setStatuses((prev) => prev.map((s, idx) => (idx === i ? "running" : s)))

      try {
        const result = await SEED_STEPS[i].action()
        if (result?.error) {
          setStatuses((prev) => prev.map((s, idx) => (idx === i ? "error" : s)))
          setErrorMessage(result.error)
          isRunningRef.current = false
          return
        }
        setStatuses((prev) => prev.map((s, idx) => (idx === i ? "complete" : s)))
      } catch {
        setStatuses((prev) => prev.map((s, idx) => (idx === i ? "error" : s)))
        setErrorMessage("An unexpected error occurred")
        isRunningRef.current = false
        return
      }
    }

    isRunningRef.current = false
    setIsComplete(true)
    toast.success("Demo data seeded successfully")
    onComplete?.()
  }, [onComplete])

  // Start seeding when modal opens
  useEffect(() => {
    if (open && !isRunningRef.current && !isComplete) {
      runSteps()
    }
  }, [open, isComplete, runSteps])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Delay reset so close animation plays
      const t = setTimeout(() => {
        setStatuses(SEED_STEPS.map(() => "pending"))
        setErrorMessage(null)
        setIsComplete(false)
        isRunningRef.current = false
      }, 200)
      return () => clearTimeout(t)
    }
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    // Prevent closing while seeding is in progress
    if (!nextOpen && isRunningRef.current) return
    onOpenChange(nextOpen)
  }

  const failedStepIndex = statuses.findIndex((s) => s === "error")

  const handleRetry = () => {
    if (failedStepIndex >= 0) {
      runSteps(failedStepIndex)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={isComplete || !!errorMessage}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isComplete ? (
              <>
                <CircleCheck className="size-5 text-emerald-500" />
                Demo Data Seeded
              </>
            ) : (
              <>
                <Database className="size-5 text-primary" />
                Seeding Demo Data
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isComplete
              ? "All sample data has been inserted successfully."
              : errorMessage
                ? "An error occurred during seeding."
                : "Inserting sample data into the database..."}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completedCount} of {SEED_STEPS.length}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps list */}
        <div className="space-y-1">
          {SEED_STEPS.map((step, i) => {
            const status = statuses[i]
            return (
              <div key={i}>
                <div className="flex items-start gap-3 rounded-md px-2 py-1.5">
                  <div className="mt-0.5 flex-shrink-0">
                    <StepIcon status={status} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={
                        status === "running"
                          ? "text-sm font-medium text-foreground"
                          : status === "complete"
                            ? "text-sm font-medium text-foreground"
                            : status === "error"
                              ? "text-sm font-medium text-destructive"
                              : "text-sm text-muted-foreground"
                      }
                    >
                      {step.label}
                    </p>
                    {(status === "running" || status === "error") && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
                {status === "error" && errorMessage && (
                  <div className="ml-9 mr-2 mt-1 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    {errorMessage}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer actions */}
        {(isComplete || errorMessage) && (
          <DialogFooter>
            {errorMessage && (
              <Button variant="outline" onClick={handleRetry}>
                Retry
              </Button>
            )}
            {isComplete && (
              <Button
                onClick={() => {
                  onOpenChange(false)
                  router.push("/dashboard")
                }}
              >
                Go to Dashboard
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case "pending":
      return <Circle className="size-4 text-muted-foreground/40" />
    case "running":
      return <Loader2 className="size-4 animate-spin text-primary" />
    case "complete":
      return <CircleCheck className="size-4 text-emerald-500 transition-all duration-300" />
    case "error":
      return <CircleX className="size-4 text-destructive" />
  }
}
