import { cn } from "@/utils/cn";
import { Loader2, LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  sizeIcon?: number;
  isLoading?: boolean;
  loadingLabel?: string;
}

export default function CommonButton({
  label,
  className,
  startIcon: StartIcon,
  endIcon: EndIcon,
  sizeIcon = 16,
  isLoading = false,
  loadingLabel,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px]",
        "text-left text-sm leading-[1.35] whitespace-pre-line",
        "hover:scale-[1.01] transition-all duration-300 ease-in-out cursor-pointer",
        "bg-[#6bc4a6] hover:bg-[#52b594] text-white font-bold",
        isLoading && "opacity-75 cursor-not-allowed",
        className,
      )}
    >
      {isLoading ? (
        <Loader2 size={sizeIcon} className="animate-spin shrink-0" />
      ) : (
        StartIcon && <StartIcon size={sizeIcon} className="shrink-0" />
      )}
      <span>{isLoading && loadingLabel ? loadingLabel : label}</span>
      {!isLoading && EndIcon && <EndIcon size={sizeIcon} className="shrink-0" />}
    </button>
  );
}
