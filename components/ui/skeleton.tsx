import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "default" | "circular" | "text"
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-emerald-200 dark:bg-emerald-800"
  
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    text: "rounded"
  }
  
  return (
    <div
      data-slot="skeleton"
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
}

export { Skeleton }
