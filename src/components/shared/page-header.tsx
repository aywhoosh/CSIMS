import Link from "next/link"
import { Button } from "@/components/ui/button"
import { type LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
    icon?: LucideIcon
  }
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button asChild>
          <Link href={action.href}>
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  )
}
