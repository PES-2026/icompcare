"use client";

import CommonButton from "@/components/ui/CommonButton";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { CustomDatePicker } from "@/components/ui/CustomDatePicker";
import { Field } from "@/components/ui/Field";
import { Controller } from "react-hook-form";
import { useSchedulingPreview } from "../../hooks/useSchedulingPreview";
import SchedulingPreviewList from "./SchedulingPreviewList";

const baseInputClass =
  "w-full px-3.5 py-2.5 bg-white border-[1.5px] rounded-md text-sm outline-none transition-colors font-sans text-stone-800";

const getValidationClass = (hasError: boolean) =>
  hasError
    ? `${baseInputClass} border-red-400 text-red-900 focus:border-red-500`
    : `${baseInputClass} border-stone-300 hover:border-stone-400 focus:border-teal-400 placeholder:text-stone-400`;

export default function SchedulingForm() {
  const {
    form,
    days,
    slots,
    previewPayload,
    disabledSlotIds,
    isLoading,
    isSaving,
    isConfirmOpen,
    hasGeneratedPreview,
    activeSlotsCount,
    removedSlotsCount,
    hasChanges,
    clearPreview,
    invalidatePreview,
    toggleSlot,
    toggleAllDaySlots, // <-- Extraído do hook
    confirmPreview,
    cancelSaveConfirmation,
    saveScheduling,
    onSubmit,
  } = useSchedulingPreview();

  const {
    register,
    control,
    trigger,
    formState: { errors },
  } = form;

  const todayStr = new Date().toLocaleDateString("sv-SE");
  const startDateValue = form.watch("startDate") as unknown as string | Date;
  const startDateStr = startDateValue
    ? typeof startDateValue === "string"
      ? startDateValue
      : startDateValue.toLocaleDateString("sv-SE")
    : "";

  return (
    <main className="flex h-full w-full flex-col p-4 md:p-6 font-sans">
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <form
          onSubmit={onSubmit}
          onChange={invalidatePreview}
          noValidate
          className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-2xl border border-[#ece7db] bg-[#faf7f0] shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
        >
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-7">
              <div className="flex mb-6 justify-between items-center flex-wrap gap-4">
                <div>
                  <h1 className="m-0 text-xl font-bold text-[#3a3530]">
                    Configurar Disponibilidade
                  </h1>
                  <p className="mt-1 text-sm text-stone-500">
                    Defina o período e revise os horários disponíveis.
                  </p>
                </div>
                <CommonButton
                  label={isLoading ? "Gerando..." : "Gerar disponibilidade"}
                  type="submit"
                  disabled={isLoading}
                  className="justify-center px-6 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-6">
                <Controller
                  name="startDate"
                  control={control}
                  render={({
                    field: { onChange, onBlur, value, ref },
                    fieldState: { error },
                  }) => (
                    <CustomDatePicker
                      ref={ref as any}
                      value={value}
                      onChange={(date) => {
                        onChange(date);
                        trigger(["startDate", "endDate"]);
                      }}
                      onBlur={onBlur}
                      label="Data de início:"
                      error={error?.message}
                      minDate={todayStr}
                      required
                    />
                  )}
                />

                <Controller
                  name="endDate"
                  control={control}
                  render={({
                    field: { onChange, onBlur, value, ref },
                    fieldState: { error },
                  }) => (
                    <CustomDatePicker
                      ref={ref as any}
                      value={value}
                      onChange={(date) => {
                        onChange(date);
                        trigger(["startDate", "endDate"]);
                      }}
                      onBlur={onBlur}
                      label="Data de fim:"
                      error={error?.message}
                      minDate={startDateStr || todayStr}
                      required
                    />
                  )}
                />

                <Field
                  label="Horário inicial:"
                  error={errors.startTime?.message}
                  required
                >
                  <input
                    type="time"
                    {...register("startTime")}
                    className={getValidationClass(!!errors.startTime)}
                    aria-invalid={!!errors.startTime}
                  />
                </Field>

                <Field
                  label="Horário final:"
                  error={errors.endTime?.message}
                  required
                >
                  <input
                    type="time"
                    {...register("endTime")}
                    className={getValidationClass(!!errors.endTime)}
                    aria-invalid={!!errors.endTime}
                  />
                </Field>

                <Field
                  label="Tempo de atendimento:"
                  error={errors.durationMinutes?.message}
                  required
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1439"
                      step="1"
                      placeholder="50"
                      {...register("durationMinutes")}
                      className={`${getValidationClass(!!errors.durationMinutes)} pr-12`}
                      aria-invalid={!!errors.durationMinutes}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                      min
                    </span>
                  </div>
                </Field>

                <Field
                  label="Pausa entre atendimentos:"
                  error={errors.breakTime?.message}
                >
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1439"
                      step="1"
                      placeholder="0"
                      {...register("breakTime")}
                      className={`${getValidationClass(!!errors.breakTime)} pr-12`}
                      aria-invalid={!!errors.breakTime}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                      min
                    </span>
                  </div>
                </Field>
              </div>
            </div>

            <div className="border-t border-[#ece7db] p-4 sm:p-7">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="m-0 text-xl font-bold text-[#3a3530]">
                    Prévia da disponibilidade
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Clique em um horário para marcá-lo como disponível ou
                    indisponível.
                  </p>
                </div>

                {hasGeneratedPreview && slots.length > 0 && (
                  <div className="flex gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-[#dff3ec] px-3 py-1.5 text-[#397b65]">
                      {activeSlotsCount} ativos
                    </span>
                    {disabledSlotIds.size > 0 && (
                      <span className="rounded-full bg-[#ffe0d8] px-3 py-1.5 text-[#b95f4c]">
                        {disabledSlotIds.size} desmarcados
                      </span>
                    )}
                  </div>
                )}
              </div>

              <SchedulingPreviewList
                days={days}
                hasGeneratedPreview={hasGeneratedPreview}
                disabledSlotIds={disabledSlotIds}
                onToggleSlot={toggleSlot}
                onToggleAllDaySlots={toggleAllDaySlots} // <-- Repassado para a lista
              />
            </div>
          </div>

          <div className="shrink-0 p-4 sm:px-7 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-stone-200 bg-stone-50/50">
            <CommonButton
              label="Cancelar"
              type="button"
              onClick={clearPreview}
              disabled={isLoading || isSaving}
              className="w-full sm:w-auto justify-center bg-[#f4a598] hover:bg-[#f0a195] text-white"
            />
            <CommonButton
              label={isSaving ? "Salvando..." : "Confirmar Registro"}
              type="button"
              onClick={confirmPreview}
              disabled={!hasGeneratedPreview || !hasChanges || isSaving}
              className="w-full sm:w-auto justify-center"
            />
          </div>
        </form>

        <ConfirmModal
          open={isConfirmOpen}
          title="Salvar agenda"
          message={`Deseja salvar as alterações na agenda? ${
            activeSlotsCount > 0
              ? `${activeSlotsCount} horários serão mantidos/criados.`
              : ""
          } ${
            removedSlotsCount > 0
              ? `${removedSlotsCount} horários serão removidos.`
              : ""
          }`}
          confirmLabel={isSaving ? "Salvando..." : "Confirmar"}
          onConfirm={isSaving ? () => undefined : saveScheduling}
          onCancel={cancelSaveConfirmation}
        />
      </div>
    </main>
  );
}
