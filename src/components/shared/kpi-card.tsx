import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: "up" | "down" | "neutral"
  className?: string
  iconColor?: string
}

/**
 * Maps a Tailwind text-color class to a matching background tint class
 * for the icon container, and an accent color class for the left border.
 */
function getIconBg(iconColor: string): string {
  if (iconColor.includes("amber")) return "bg-amber-100 dark:bg-amber-500/15"
  if (iconColor.includes("destructive") || iconColor.includes("red")) return "bg-red-100 dark:bg-red-500/15"
  if (iconColor.includes("emerald")) return "bg-emerald-100 dark:bg-emerald-500/15"
  if (iconColor.includes("violet") || iconColor.includes("purple")) return "bg-violet-100 dark:bg-violet-500/15"
  if (iconColor.includes("blue")) return "bg-blue-100 dark:bg-blue-500/15"
  if (iconColor.includes("orange")) return "bg-orange-100 dark:bg-orange-500/15"
  // Default: primary green
  return "bg-primary/10"
}

function getAccentColor(iconColor: string): string {
  if (iconColor.includes("amber")) return "from-amber-400 to-amber-500"
  if (iconColor.includes("destructive") || iconColor.includes("red")) return "from-red-400 to-red-500"
  if (iconColor.includes("emerald")) return "from-emerald-400 to-emerald-600"
  if (iconColor.includes("violet") || iconColor.includes("purple")) return "from-violet-400 to-violet-500"
  if (iconColor.includes("blue")) return "from-blue-400 to-blue-500"
  if (iconColor.includes("orange")) return "from-orange-400 to-orange-500"
  // Default: primary green
  return "from-[#8CB82B] to-[#6d9a1a]"
}

export function KPICard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  iconColor = "text-primary",
}: KPICardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Decorative gradient accent on the left */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b",
          getAccentColor(iconColor)
        )}
      />
      <CardContent className="p-6 pl-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p
                className={cn(
                  "text-xs",
                  trend === "up" && "text-green-600",
                  trend === "down" && "text-red-600",
                  !trend && "text-muted-foreground"
                )}
              >
                {description}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg",
              getIconBg(iconColor)
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
