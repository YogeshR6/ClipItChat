import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = {
  icon?: React.ElementType;
  onIconClick?: () => void;
} & React.ComponentProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, onIconClick, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-zinc-800 dark:file:text-zinc-50 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
            className
          )}
          ref={ref}
          {...props}
        />
        {Icon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
          >
            <Icon />
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
