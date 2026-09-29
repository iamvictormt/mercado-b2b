import * as React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePickerProps = {
  value?: Date | undefined;
  onChange?: ((date: Date | undefined) => void) | undefined;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  locale?: "pt" | "en";
  className?: string;
  triggerClassName?: string;
  labelClassName?: string;
  id?: string;
};

export function DatePicker({
  value,
  onChange,
  label,
  hint,
  placeholder = "Selecionar data",
  disabled,
  locale = "pt",
  className,
  triggerClassName,
  labelClassName,
  id,
}: DatePickerProps) {
  const generatedId = React.useId();
  const pickerId = id ?? generatedId;
  const hintId = hint ? `${pickerId}-hint` : undefined;

  return (
    <div className={cn("block space-y-2", className)}>
      {label && (
        <label
          htmlFor={pickerId}
          className={cn(
            "block text-[10px] font-semibold uppercase tracking-widest",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={pickerId}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-describedby={hintId}
            className={cn(
              "h-12 w-full justify-start gap-3 rounded border-input bg-card px-3 text-left text-sm font-normal shadow-sm hover:bg-card",
              !value && "text-muted-foreground",
              triggerClassName,
            )}
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 truncate">
              {value
                ? format(value, "d MMM yyyy", locale === "pt" ? { locale: pt } : undefined)
                : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            required={false}
            selected={value}
            onSelect={(date) => onChange?.(date)}
            initialFocus
            locale={locale === "pt" ? pt : undefined}
            className={cn("pointer-events-auto p-3")}
          />
        </PopoverContent>
      </Popover>
      {hint && (
        <p id={hintId} className="text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
