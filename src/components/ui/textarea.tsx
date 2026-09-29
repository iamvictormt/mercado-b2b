import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.ComponentProps<"textarea"> & {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  textareaClassName?: string;
  labelClassName?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, textareaClassName, labelClassName, label, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const control = (
      <textarea
        id={textareaId}
        aria-describedby={hintId}
        className={cn(
          "min-h-28 w-full resize-y rounded border border-input bg-card px-3 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          textareaClassName,
        )}
        ref={ref}
        {...props}
      />
    );

    if (label || hint) {
      return (
        <div className={cn("block space-y-2", className)}>
          {label && (
            <label
              htmlFor={textareaId}
              className={cn(
                "block text-[10px] font-semibold uppercase tracking-widest",
                labelClassName,
              )}
            >
              {label}
            </label>
          )}
          {control}
          {hint && (
            <p id={hintId} className="text-xs leading-5 text-muted-foreground">
              {hint}
            </p>
          )}
        </div>
      );
    }

    return <span className={cn("block", className)}>{control}</span>;
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
