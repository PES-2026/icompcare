import CommonButton from "../ui/CommonButton";

export type ConfirmVariant = "primary" | "warning" | "critical";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel,
  confirmColor = "primary",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null;

  const buttonVariants: Record<ConfirmVariant, string> = {
    primary: "bg-[#6bc4a6] hover:bg-[#52b594] border-[#52b594] text-white",
    warning: "bg-[#ffdb9e] hover:bg-[#dbbd88] border-[#dbbd88] text-white",
    critical: "bg-[#f4a598] hover:bg-[#f0a195] border-[#f0a195] text-white",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      onClick={onCancel}
    >
      <div
        className="w-[90%] max-w-100 rounded-2xl bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2.5 text-lg font-extrabold text-[#3a3530]">
          {title}
        </h2>

        <p className="mb-7 text-sm leading-[1.6] text-[#6a6560]">{message}</p>

        <div className="flex justify-end gap-3">
          <CommonButton
            label="Cancelar"
            onClick={onCancel}
            className="border border-[#e2ddd5] bg-[#faf7f0] text-[#6a6560] hover:bg-[#f3f0e5]"
          />
          <CommonButton
            label={confirmLabel}
            onClick={onConfirm}
            className={buttonVariants[confirmColor]}
          />
        </div>
      </div>
    </div>
  );
};
