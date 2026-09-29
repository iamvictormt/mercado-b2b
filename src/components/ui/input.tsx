import * as React from "react";

import { cn } from "@/lib/utils";

export const maskFormatters = {
  integer: (value: string) => value.replace(/\D/g, ""),
  money: (value: string) => value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " "),
  decimalMoney: (value: string) => {
    const normalized = value.replaceAll(".", ",").replace(/[^\d,]/g, "");
    const [rawInteger = "", ...decimalParts] = normalized.split(",");
    const integer = (rawInteger.replace(/^0+(?=\d)/, "") || "0").replace(
      /\B(?=(\d{3})+(?!\d))/g,
      " ",
    );
    const decimals = decimalParts.join("").slice(0, 2);
    return normalized.includes(",") ? `${integer},${decimals}` : integer;
  },
  currency: (value: string) => value.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 3),
  stpPhone: (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 7);
    return digits.replace(/(\d{3})(\d{0,4})/, (_, first: string, rest: string) =>
      rest ? `${first} ${rest}` : first,
    );
  },
};

type InputProps = Omit<React.ComponentProps<"input">, "prefix"> & {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  mask?: (value: string) => string;
  controlClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      controlClassName,
      inputClassName,
      labelClassName,
      label,
      hint,
      prefix,
      suffix,
      mask,
      type,
      onChange,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) event.currentTarget.value = mask(event.currentTarget.value);
      onChange?.(event);
    };

    const control = (
      <span
        className={cn(
          "group flex min-h-12 w-full items-center gap-3 rounded border border-input bg-card px-3 shadow-sm transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
          props.disabled && "cursor-not-allowed opacity-50",
          controlClassName,
        )}
      >
        {prefix && <span className="shrink-0 text-sm text-muted-foreground">{prefix}</span>}
        <input
          id={inputId}
          type={type}
          aria-describedby={hintId}
          className={cn(
            "h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
            type === "date" && "[color-scheme:light]",
            inputClassName,
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {suffix && <span className="shrink-0 text-sm text-muted-foreground">{suffix}</span>}
      </span>
    );

    if (label || hint) {
      return (
        <div className={cn("block space-y-2", className)}>
          {label && (
            <label
              htmlFor={inputId}
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
Input.displayName = "Input";

const MaskedInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>((props, ref) => (
  <Input ref={ref} type="text" {...props} />
));
MaskedInput.displayName = "MaskedInput";

const DateInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>((props, ref) => (
  <Input ref={ref} type="date" {...props} />
));
DateInput.displayName = "DateInput";

export { DateInput, Input, MaskedInput };
