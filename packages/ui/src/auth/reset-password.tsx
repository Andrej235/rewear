"use client";
import { Api } from "@repo/lib/api/api";
import { Navigate } from "@repo/lib/types/navigate";
import { EMAIL_REGEX } from "@repo/lib/utils/regex";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../common/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../common/card";
import { Field, FieldError, FieldLabel } from "../common/field";
import { Input } from "../common/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../common/input-otp";
import { CountdownTimer } from "../countdown-timer";

export function ResetPassword({
  api,
  navigate,
  params,
}: {
  api: Api;
  navigate: Navigate;
  params: URLSearchParams;
}) {
  const tokenParam = params.get("token");
  const emailParam = params.get("email");

  const [isCountdownActive, setIsCountdownActive] = useState(false);

  const [email, setEmail] = useState(
    !EMAIL_REGEX.test(emailParam ?? "") ? null : emailParam,
  );
  const [otp, setOtp] = useState(tokenParam ?? "");

  const [currentStep, setCurrentStep] = useState<"email" | "code" | "password">(
    !email ? "email" : otp.length !== 6 ? "code" : "password",
  );

  async function handleSubmitCode() {
    if (!email || !otp || otp.length !== 6) return;
    setCurrentStep("password");
  }

  const sentVerification = useRef(false);
  async function handleResendEmail() {
    if (sentVerification.current || !email) return;
    sentVerification.current = true;

    const response = await api.sendRequest(
      "/users/send-reset-password-email",
      {
        method: "post",
        payload: {
          email,
        },
      },
      {
        toasts: {
          loading: "Sending reset email, please wait...",
          success: "Reset email sent successfully!",
          error: (x) => x.message || "Failed to resend email",
        },
      },
    );

    // Timeout to prevent clicks before react rerenders the component with countdown set to true
    setTimeout(() => {
      sentVerification.current = false;
    }, 300);
    if (!response.isOk) return;

    setIsCountdownActive(true);
    setCurrentStep("code");
  }

  type PasswordFields = "password" | "confirmPassword";

  const [touched, setTouched] = useState<
    Partial<Record<PasswordFields, boolean>>
  >({});
  const [errors, setErrors] = useState<
    Record<PasswordFields, { message?: string }[]>
  >({
    password: [],
    confirmPassword: [],
  });
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const validateField = (field: PasswordFields, value: string): boolean => {
    const newErrors = { ...errors };

    if (field === "password") {
      newErrors.password = [];
      if (!value.trim()) {
        newErrors.password.push({ message: "Password is required" });
      } else if (value.length < 8) {
        newErrors.password.push({
          message: "Password must be at least 8 characters",
        });
      }
    }

    if (field === "confirmPassword") {
      newErrors.confirmPassword = [];
      if (!value.trim()) {
        newErrors.confirmPassword.push({
          message:
            "Please confirm your password to make sure you typed it correctly",
        });
      } else if (value !== formData.password) {
        newErrors.confirmPassword.push({ message: "Passwords do not match" });
      }
    }

    setErrors(newErrors);
    return newErrors[field].length === 0;
  };

  const handleBlur = (field: PasswordFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: PasswordFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({
      password: true,
      confirmPassword: true,
    });
    let err = true;
    err &&= validateField("password", formData.password);
    err &&= validateField("confirmPassword", formData.confirmPassword);

    if (!err) return;

    if (!email || !EMAIL_REGEX.test(email ?? "")) {
      toast.error("Invalid email");
      setCurrentStep("email");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Invalid or missing OTP code");
      setCurrentStep("code");
      return;
    }

    const { isOk } = await api.sendRequest(
      "/users/reset-password",
      {
        method: "patch",
        payload: {
          email: email,
          token: otp,
          newPassword: formData.password,
        },
      },
      {
        toasts: {
          success: "Password changed successfully! You can now log in.",
          loading: "Changing your password...",
          error: (e) =>
            e.message || "An error occurred while changing your password.",
        },
      },
    );

    if (!isOk) return;
    navigate("/login");
  };

  if (currentStep === "email") {
    return (
      <Card className="relative aspect-square w-full max-w-[min(95vw,32rem)] justify-center">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/25">
            <RotateCcw className="size-8 text-primary" />
          </div>

          <CardTitle className="text-2xl font-bold">
            Reset your password
          </CardTitle>

          <CardDescription className="text-base">
            Enter your email address to receive a password reset link.
          </CardDescription>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("..")}
            className="absolute top-2 left-2"
          >
            <ArrowLeft />
          </Button>
        </CardHeader>

        <CardContent className="text-center">
          <Input
            value={email ?? ""}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com"
          />
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full"
            disabled={!EMAIL_REGEX.test(email ?? "")}
            onClick={handleResendEmail}
          >
            Send reset email
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (currentStep === "code") {
    return (
      <Card className="aspect-square w-full max-w-lg justify-center">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/25">
            <RotateCcw className="size-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Reset your password
          </CardTitle>

          <CardDescription className="text-base">
            We&apos;ve sent you a reset link to{" "}
            <span className="font-medium">{emailParam}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit code from the email you received to reset your
              password. Check your spam folder if you don&apos;t see the email.
            </p>
          </div>

          <div className="mt-8 flex w-full justify-center">
            <InputOTP
              maxLength={6}
              minLength={6}
              onChange={(x) => setOtp(x.toUpperCase())}
              onKeyDown={(x) => {
                if (x.key === "Enter" && otp.length === 6) handleSubmitCode();
              }}
              value={otp}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>

              <InputOTPSeparator />

              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="grid w-full gap-x-2 lg:grid-cols-2">
            <Button
              className="w-full"
              disabled={otp.length !== 6}
              onClick={handleSubmitCode}
            >
              Reset password
            </Button>

            <Button
              onClick={handleResendEmail}
              disabled={isCountdownActive}
              className="w-full"
            >
              {isCountdownActive ? (
                <span className="flex items-center">
                  Resend code in{" "}
                  <CountdownTimer
                    seconds={90}
                    onComplete={() => setIsCountdownActive(false)}
                  />
                </span>
              ) : (
                <span>Resend code</span>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="aspect-square w-full max-w-lg justify-center">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/25">
          <RotateCcw className="size-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Choose your new password
        </CardTitle>

        <CardDescription className="text-base">
          Enter a new password for your account below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Field data-invalid={touched.password && errors.password.length !== 0}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            aria-invalid={touched.password && errors.password.length !== 0}
          />
          <FieldError errors={errors.password} />
        </Field>

        <Field
          data-invalid={
            touched.confirmPassword && errors.confirmPassword.length !== 0
          }
        >
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            aria-invalid={
              touched.confirmPassword && errors.confirmPassword.length !== 0
            }
          />
          <FieldError errors={errors.confirmPassword} />
        </Field>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <Button
          className="w-full"
          disabled={otp.length !== 6}
          onClick={handleSubmit}
        >
          Set new password
        </Button>
      </CardFooter>
    </Card>
  );
}
