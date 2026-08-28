import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function AppCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-[230px] rounded-[var(--radius-card)] p-5 border border-border/50 bg-card/40 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      
      <div className="flex-1 space-y-3 mb-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/10">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-[var(--radius-button)]" />
      </div>
    </motion.div>
  );
}
