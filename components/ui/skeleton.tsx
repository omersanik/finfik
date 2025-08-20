import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "default" | "circular" | "text"
}

function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const baseClasses = "relative overflow-hidden bg-gray-200 dark:bg-gray-700"
  
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
    >
      {/* Facebook-style shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" style={{ width: '200%' }} />
    </div>
  )
}

export { Skeleton }
