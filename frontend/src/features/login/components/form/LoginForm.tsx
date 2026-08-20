"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Images } from "@/assets";
import CommonButton from "@/components/ui/CommonButton";
import { Field } from "@/components/ui/Field";
import { PATHS } from "@/constants/paths";
import { cn } from "@/utils/cn";
import { useAppNavigation } from "@/utils/navigator";
import { useLogin } from "../../hooks/useLogin";

export default function LoginForm() {
  const { handleNavigation } = useAppNavigation();

  const { form, isLoading, globalError, onSubmit } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  const [showPassword, setShowPassword] = useState(false);

  const baseInputClass =
    "w-full px-3.5 py-2.5 border-[1.5px] rounded-md bg-white text-sm text-stone-800 outline-none transition-colors font-sans";

  const getValidationClass = (hasError: boolean) =>
    hasError
      ? `${baseInputClass} border-red-300 bg-red-50 focus:border-red-400`
      : `${baseInputClass} border-stone-300 hover:border-stone-400 focus:border-teal-400`;

  const handleForgotPassword = () => {
    handleNavigation({ path: PATHS.forgot_password });
  };

  const handleCreateAccount = () => {
    handleNavigation({ path: PATHS.register });
  };

  return (
    <main className="flex min-w-0 flex-1 w-full min-h-screen items-center justify-center bg-[#f5f0e8] p-4 sm:p-6 font-['Nunito','Segoe_UI',sans-serif]">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-[#ece7db] shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        {/* Left Panel */}
        <div className="hidden relative lg:flex lg:w-1/2 flex-col justify-between bg-[#1a2e28] border-r border-[#1a2e28] p-10 overflow-hidden">
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
              Bem-vindo(a) de volta ao
              <br />
              <span className="text-[#6bc4a6] font-bold">SAP IComp</span>
            </h1>
            <p className="text-sm text-[#aac9bf] leading-relaxed">
              Serviço de Apoio Pedagógico do Instituto de Computação. Acesse sua
              conta para continuar.
            </p>
          </div>

          <div className="relative z-10 border-t border-[rgba(107,196,166,0.2)] pt-6">
            <p className="text-sm text-[#aac9bf]">
              Não possui conta?{" "}
              <Link
                href={PATHS.register}
                className="font-bold underline text-[#6bc4a6] hover:text-[#8dd4bb] transition-colors"
              >
                Solicitar acesso →
              </Link>
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex flex-col">
          <div className="shrink-0 px-8 pt-8 pb-4 flex flex-col items-center border-b border-stone-100 lg:items-start">
            <Image
              src={Images.logoHorizontal}
              alt="SAP iComp Logo"
              className="mb-4 h-9 w-auto lg:hidden"
              priority
            />
            <h2 className="text-xl font-bold text-stone-800">
              Acesso ao Sistema
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Insira suas credenciais para entrar
            </p>
          </div>

          <div className="flex-1 min-h-0 px-4 sm:px-8 py-6 overflow-y-auto">
            {globalError && (
              <div className="mb-5 p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                {globalError}
              </div>
            )}

            <form onSubmit={onSubmit} noValidate>
              <div className="flex flex-col gap-4">
                <Field label="E-mail:" error={errors.email?.message} required>
                  <input
                    type="email"
                    placeholder="pedagoga@icomp.ufam.edu.br"
                    {...register("email")}
                    className={getValidationClass(!!errors.email)}
                    aria-label="E-mail"
                  />
                </Field>

                <div className="flex flex-col gap-1">
                  <Field
                    label="Senha:"
                    error={errors.password?.message}
                    required
                  >
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        className={cn(
                          getValidationClass(!!errors.password),
                          "pr-10",
                        )}
                        aria-label="Senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
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

                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm font-semibold text-[#6bc4a6] hover:text-teal-700 transition-colors cursor-pointer"
                      aria-label="Esqueci minha senha"
                    >
                      Esqueci minha senha?
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <CommonButton
                  label="Entrar"
                  type="submit"
                  isLoading={isLoading}
                  loadingLabel="Entrando..."
                  className="w-full justify-center"
                  aria-label="Entrar"
                />

                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <Lock size={12} className="text-stone-400" />
                  <span className="text-xs text-stone-400">
                    Acesso seguro e restrito
                  </span>
                </div>

                <p className="text-sm text-center text-stone-500 lg:hidden mt-3">
                  Não possui conta?{" "}
                  <button
                    type="button"
                    onClick={handleCreateAccount}
                    className="font-semibold text-[#6bc4a6] hover:text-teal-700 transition-colors cursor-pointer"
                  >
                    Solicitar acesso
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
