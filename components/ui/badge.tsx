import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        high: "border-[#f85149] bg-[#f851491f] text-[#ff7b72]",
        medium: "border-[#d29922] bg-[#d299221f] text-[#e3b341]",
        low: "border-[#238636] bg-[#2386361f] text-[#3fb950]",
        neutral: "border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
