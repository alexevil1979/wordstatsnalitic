import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      tone: {
        slate: "bg-slate-50 text-slate-700 ring-slate-200",
        teal: "bg-teal-50 text-teal-800 ring-teal-200",
        amber: "bg-amber-50 text-amber-800 ring-amber-200",
        rose: "bg-rose-50 text-rose-800 ring-rose-200",
        emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200",
        sky: "bg-sky-50 text-sky-800 ring-sky-200",
      },
    },
    defaultVariants: { tone: "slate" },
  }
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
