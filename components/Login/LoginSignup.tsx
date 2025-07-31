"use client";
import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Bot } from "lucide-react";
import { CountrySelector } from "./CountrySelector";
import {
  PhoneFormData,
  phoneSchema,
  OtpFormData,
  otpSchema,
} from "@/utils/validations";

interface User {
  id: string;
  phoneNumber: string;
  isAuthenticated: boolean;
}

interface LoginSignupProps {
  onAuthenticated: (user: User) => void;
  theme: "light" | "dark";
}

const getThemeClasses = (theme: "light" | "dark") => ({
  background:
    theme === "dark"
      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      : "bg-gradient-to-br from-slate-50 via-white to-slate-100",
  text: {
    primary: theme === "dark" ? "text-text-primary-dark" : "text-gray-900",
    secondary: theme === "dark" ? "text-text-secondary-dark" : "text-gray-600",
    label: theme === "dark" ? "text-text-primary-dark" : "text-gray-700",
  },
  input: {
    background: theme === "dark" ? "bg-brand-secondary-dark" : "bg-white",
    border: theme === "dark" ? "border-border-dark" : "border-gray-300",
    text: theme === "dark" ? "text-text-primary-dark" : "text-gray-900",
  },
  button: {
    hover:
      theme === "dark" ? "hover:bg-brand-secondary-dark" : "hover:bg-gray-100",
  },
  demoBox: {
    background:
      theme === "dark"
        ? "bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-blue-700"
        : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
    text: {
      title: theme === "dark" ? "text-blue-200" : "text-blue-900",
      subtitle: theme === "dark" ? "text-blue-300" : "text-blue-700",
    },
    code: {
      background:
        theme === "dark"
          ? "bg-brand-secondary-dark border-blue-600"
          : "bg-white border-blue-300",
      text: theme === "dark" ? "text-blue-200" : "text-blue-900",
    },
  },
});

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const GridPattern = ({ id }: { id: string }) => (
  <svg
    className="w-full h-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <defs>
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <path
          d="M 10 0 L 0 0 0 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </pattern>
    </defs>
    <rect width="100" height="100" fill={`url(#${id})`} />
  </svg>
);

const LeftPanel = ({
  title,
  description,
  patternId,
}: {
  title: string;
  description: string;
  patternId: string;
}) => (
  <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <GridPattern id={patternId} />
      </div>
    </div>
    <div className="relative z-10 flex flex-col justify-center items-center px-12 py-16 w-full">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Bot className="w-4 lg:w-8 h-4 lg:h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
        <p className="text-slate-300 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const FormInput = ({
  label,
  error,
  theme,
  ...inputProps
}: {
  label: string;
  error?: string;
  theme: "light" | "dark";
  [key: string]: any;
}) => {
  const classes = getThemeClasses(theme);
  return (
    <div className="space-y-2">
      <label
        htmlFor={inputProps.id}
        className={`text-sm font-medium leading-none ${classes.text.label}`}
      >
        {label}
      </label>
      <input
        {...inputProps}
        className={`flex h-12 w-full rounded-xl border px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          error ? "border-red-500" : classes.input.border
        } ${classes.input.background} ${classes.input.text}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export function LoginSignup({ onAuthenticated, theme }: LoginSignupProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [fullPhoneNumber, setFullPhoneNumber] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const countrySelectorButtonRef = useRef<HTMLButtonElement>(null);

  const classes = getThemeClasses(theme);

  const {
    control: phoneControl,
    register: phoneRegister,
    handleSubmit: handlePhoneSubmitForm,
    formState: { errors: phoneErrors },
    reset: resetPhoneForm,
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "",
      phoneNumber: "",
    },
  });

  const {
    register: otpRegister,
    handleSubmit: handleOtpSubmitForm,
    formState: { errors: otpErrors },
    reset: resetOtpForm,
    setValue: setOtpValue,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && step === "otp") {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const onPhoneSubmit = async (data: PhoneFormData) => {
    setGeneralError(null);
    setLoading(true);

    const currentFullPhoneNumber = `${data.countryCode}${data.phoneNumber}`;
    setFullPhoneNumber(currentFullPhoneNumber);

    setTimeout(() => {
      const generatedOtp = generateOtp();
      setDemoOtp(generatedOtp);
      setStep("otp");
      setTimeout(() => setOtpValue("otp", ""), 0);
      setCountdown(30);
      setCanResend(false);
      setLoading(false);
      resetOtpForm({ otp: "" });
      console.log(
        `Generated OTP for ${currentFullPhoneNumber}: ${generatedOtp}`
      );
    }, 1000);
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    setGeneralError(null);
    setLoading(true);

    setTimeout(() => {
      if (countdown === 0 && !canResend) {
        setGeneralError("OTP has expired. Please request a new OTP.");
        setLoading(false);
        return;
      }

      if (data.otp === demoOtp) {
        const user: User = {
          id: Date.now().toString(),
          phoneNumber: fullPhoneNumber,
          isAuthenticated: true,
        };
        onAuthenticated(user);
      } else {
        setGeneralError(
          "Wrong OTP entered. Please check the demo OTP and try again."
        );
      }
      setLoading(false);
    }, 500);
  };

  const handleResendOtp = () => {
    setLoading(true);
    setGeneralError(null);

    setTimeout(() => {
      const newOtp = generateOtp();
      setDemoOtp(newOtp);
      setCountdown(30);
      setCanResend(false);
      resetOtpForm({ otp: "" });
      setLoading(false);
      console.log(`New OTP for ${fullPhoneNumber}: ${newOtp}`);
    }, 1000);
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setDemoOtp("");
    setGeneralError(null);
    setCountdown(0);
    setCanResend(false);
    resetPhoneForm();
    resetOtpForm();
    if (countrySelectorButtonRef.current) {
      countrySelectorButtonRef.current.focus();
    }
  };

  if (step === "phone") {
    return (
      <div className={`min-h-screen w-full flex ${classes.background}`}>
        <LeftPanel
          title="Secure Authentication"
          description="Enter your phone number to get started with secure verification"
          patternId="grid"
        />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${classes.text.primary}`}>
                Phone Verification
              </h2>
              <p className={classes.text.secondary}>
                We'll send you a verification code to confirm your identity
              </p>
            </div>

            <form
              onSubmit={handlePhoneSubmitForm(onPhoneSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="countryCode"
                  className={`text-sm font-medium leading-none ${classes.text.label}`}
                >
                  Country
                </label>
                <Controller
                  name="countryCode"
                  control={phoneControl}
                  render={({ field }) => (
                    <CountrySelector
                      value={field.value}
                      onChange={field.onChange}
                      error={phoneErrors.countryCode?.message}
                      theme={theme}
                      buttonRef={countrySelectorButtonRef}
                    />
                  )}
                />
              </div>

              <FormInput
                id="phoneNumber"
                label="Phone Number"
                type="tel"
                placeholder="Enter phone number"
                error={phoneErrors.phoneNumber?.message}
                theme={theme}
                {...phoneRegister("phoneNumber")}
              />

              {generalError && (
                <p className="text-sm text-red-500">{generalError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <LoadingSpinner />
                    <span>Sending verification code...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Continue</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p
                className={`text-sm leading-relaxed ${classes.text.secondary}`}
              >
                By continuing, you agree to our{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex ${classes.background}`}>
      <LeftPanel
        title="Verification Sent"
        description="We've sent a secure code to your phone number for verification"
        patternId="grid-otp"
      />

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToPhone}
              className={`p-2 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${classes.button.hover} ${classes.text.primary}`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h2 className={`text-3xl font-bold ${classes.text.primary}`}>
                Enter Verification Code
              </h2>
              <p className={`mt-1 ${classes.text.secondary}`}>
                Check your messages for the 6-digit code
              </p>
            </div>
          </div>

          <div
            className={`mb-8 p-6 border-2 rounded-2xl ${classes.demoBox.background}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${classes.demoBox.text.title}`}
                >
                  Demo Code (Development Only)
                </p>
                <p className={`text-xs ${classes.demoBox.text.subtitle}`}>
                  Copy this code to proceed
                </p>
              </div>
            </div>
            <div
              className={`p-4 rounded-xl border-2 font-mono text-2xl text-center font-bold tracking-widest ${classes.demoBox.code.background} ${classes.demoBox.code.text}`}
            >
              {demoOtp}
            </div>
          </div>

          <form
            onSubmit={handleOtpSubmitForm(onOtpSubmit)}
            className="space-y-6"
          >
            <FormInput
              id="otp"
              label="OTP Code"
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              error={otpErrors.otp?.message}
              theme={theme}
              {...otpRegister("otp")}
            />

            {generalError && (
              <p className="text-sm text-red-500">{generalError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <LoadingSpinner />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Verify & Continue</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}
            </button>

            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200 focus:outline-none focus:underline disabled:opacity-50"
                >
                  Resend verification code
                </button>
              ) : (
                <p className={`text-sm ${classes.text.secondary}`}>
                  Didn't receive the code? Resend in{" "}
                  <span className="font-semibold text-blue-600">
                    {countdown}s
                  </span>
                </p>
              )}
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className={`text-sm ${classes.text.secondary}`}>
              Having trouble? Contact our{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
