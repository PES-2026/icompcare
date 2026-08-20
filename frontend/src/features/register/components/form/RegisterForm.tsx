"use client";

import { Eye, EyeOff, Lock, MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useWatch } from "react-hook-form";

import { Images } from "@/assets";
import CommonButton from "@/components/ui/CommonButton";
import { Field } from "@/components/ui/Field";
import { PATHS } from "@/constants/paths";
import { cn } from "@/utils/cn";
import { useAppNavigation } from "@/utils/navigator";
import { maskPhone } from "@/utils/utils";
import { useRegister } from "../../hooks/useRegister";
import { PasswordRequirements } from "./PasswordRequirements";

export default function RegisterForm() {
  const { handleNavigation } = useAppNavigation();

  const {
    form,
    isLoading,
    isSubmitted,
    registeredEmail,
    globalError,
    onSubmit,
  } = useRegister();
  const {
    register,
    control,
    formState: { errors },
  } = form;

  const password = useWatch({ control, name: "password", defaultValue: "" });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const baseInputClass =
    "w-full px-3.5 py-2.5 border-[1.5px] rounded-md bg-white text-sm text-stone-800 outline-none transition-colors font-sans";

  const getValidationClass = (hasError: boolean) =>
    hasError
      ? `${baseInputClass} border-red-300 bg-red-50 focus:border-red-400`
      : `${baseInputClass} border-stone-300 hover:border-stone-400 focus:border-teal-400`;

  if (isSubmitted) {
    return (
      <main className="flex min-w-0 flex-1 w-full min-h-screen items-center justify-center bg-[#f5f0e8] p-4 font-['Nunito','Segoe_UI',sans-serif]">
        <section className="flex w-full max-w-md flex-col items-center rounded-2xl bg-white border border-[#ece7db] shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-7 py-10 text-center">
          <Image
            src={Images.logoHorizontal}
            alt="SAP iComp Logo"
            className="mb-6 h-10 w-auto"
            style={{ height: "auto" }}
            priority
          />
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#6bc4a6] text-white">
            <MailCheck size={32} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">Quase lá!</h1>
          <p className="mt-3 mb-6 text-sm leading-6 text-stone-500">
            Seu pedido está em análise. Avisaremos no e-mail{" "}
            <strong className="text-stone-800">{registeredEmail}</strong> assim
            que for aprovado.
          </p>
          <CommonButton
            label="Voltar para o Login"
            onClick={() => handleNavigation({ path: PATHS.login })}
            className="w-full justify-center"
          />
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 w-full min-h-screen items-center justify-center bg-[#f5f0e8] p-4 sm:p-6 font-['Nunito','Segoe_UI',sans-serif]">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl border border-[#ece7db] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="hidden relative lg:flex lg:w-2/5 flex-col justify-between bg-[#1a2e28] border-r border-[#1a2e28] p-10 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#2a4a3e] opacity-60" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-[#223d33] opacity-50" />
          <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full bg-[#6bc4a6] opacity-5" />
          <div className="relative z-10">
            <div className="w-full flex justify-center">
              <Image
                src={Images.logoHorizontal}
                alt="SAP iComp Logo"
                className="h-15 w-auto mb-10 brightness-0 invert justify-center"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold text-white leading-snug mb-3">
              Bem-vindo(a) ao
              <br />
              <span className="text-[#6bc4a6] font-bold">SAP IComp</span>
            </h1>
            <p className="text-sm text-[#aac9bf] leading-relaxed">
              Serviço de Apoio Pedagógico do Instituto de Computação. Solicite
              seu acesso para começar.
            </p>
          </div>

          <div className="relative z-10 border-t border-[rgba(107,196,166,0.2)] pt-6">
            <p className="text-sm text-[#aac9bf]">
              Já tem uma conta?{" "}
              <Link
                href={PATHS.login}
                className="font-bold underline text-[#6bc4a6] hover:text-[#8dd4bb] transition-colors"
              >
                Fazer login →
              </Link>
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white flex flex-col">
          <div className="shrink-0 px-8 pt-8 pb-4 flex flex-col items-center border-b border-stone-100 lg:items-start">
            <Image
              src={Images.logoHorizontal}
              alt="SAP iComp Logo"
              className="mb-4 h-9 w-auto lg:hidden"
              priority
            />
            <h2 className="text-xl font-bold text-stone-800">Criar conta</h2>
            <p className="text-sm text-stone-500 mt-1">
              Informe seus dados para solicitar acesso
            </p>
          </div>

          <div className="flex-1 min-h-0 px-4 sm:px-8 py-6 overflow-y-auto">
            {globalError && (
              <div className="mb-5 p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                {globalError}
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field
                    label="Nome completo:"
                    error={errors.name?.message}
                    required
                  >
                    <input
                      type="text"
                      placeholder="Ex: Maria da Silva"
                      {...register("name")}
                      className={getValidationClass(!!errors.name)}
                    />
                  </Field>
                </div>

                <Field
                  label="Nº de registro:"
                  error={errors.registrationNumber?.message}
                  required
                >
                  <input  
                    type="text"
                    placeholder="12345678"
                    maxLength={8}
                    {...register("registrationNumber")}
                    className={getValidationClass(!!errors.registrationNumber)}
                  />
                </Field>

                <Field
                  label="Telefone:"
                  error={errors.phoneNumber?.message}
                  required
                >
                  <input
                    type="tel"
                    placeholder="(92) 99999-9999"
                    {...register("phoneNumber", {
                      onChange: (e) => {
                        e.target.value = maskPhone(e.target.value);
                      },
                    })}
                    className={getValidationClass(!!errors.phoneNumber)}
                  />
                </Field>

                <Field label="E-mail:" error={errors.email?.message} required>
                  <input
                    type="email"
                    placeholder="nome@icomp.ufam.edu.br"
                    {...register("email")}
                    className={getValidationClass(!!errors.email)}
                  />
                </Field>

                <Field
                  label="Confirmar e-mail:"
                  error={errors.confirmEmail?.message}
                  required
                >
                  <input
                    type="email"
                    placeholder="nome@icomp.ufam.edu.br"
                    {...register("confirmEmail")}
                    className={getValidationClass(!!errors.confirmEmail)}
                  />
                </Field>

                <div className="flex flex-col gap-1">
                  <Field label="Senha:" required>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        className={cn(
                          getValidationClass(!!errors.password),
                          "pr-10",
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </Field>
                  {password.trim().length > 0 && (
                    <PasswordRequirements password={password} />
                  )}
                </div>

                <Field
                  label="Confirmar senha:"
                  error={errors.confirmPassword?.message}
                  required
                >
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className={cn(
                        getValidationClass(!!errors.confirmPassword),
                        "pr-10",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                      aria-label={
                        showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </Field>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <CommonButton
                  label="Solicitar acesso"
                  type="submit"
                  isLoading={isLoading}
                  loadingLabel="Enviando..."
                  className="w-full justify-center"
                />

                <div className="flex items-center justify-center gap-1.5">
                  <Lock size={12} className="text-stone-400" />
                  <span className="text-xs text-stone-400">
                    Seus dados são protegidos e criptografados
                  </span>
                </div>

                <p className="text-sm text-center text-stone-500 lg:hidden">
                  Já tem uma conta?{" "}
                  <Link
                    href={PATHS.login}
                    className="font-semibold text-[#6bc4a6] hover:text-teal-700 transition-colors"
                  >
                    Fazer login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
