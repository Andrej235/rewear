"use client";
import { Api } from "@repo/lib/api/api";
import { LinkComp } from "@repo/lib/types/link-comp";
import { FormEvent, JSX, useState } from "react";
import { Button } from "./common/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./common/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./common/field";
import { Input } from "./common/input";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({
  className,
  api,
  onLogin,
  LinkComp: Link,
}: {
  className?: string;
  api: Api;
  onLogin: () => void;
  LinkComp: LinkComp;
}): JSX.Element {
  type LoginFields = "email" | "password";

  const [touched, setTouched] = useState<Partial<Record<LoginFields, boolean>>>(
    {},
  );
  const [errors, setErrors] = useState<
    Record<LoginFields, { message?: string }[]>
  >({
    email: [],
    password: [],
  });
  const [formData, setFormData] = useState({ email: "", password: "" });

  const validateField = (field: LoginFields, value: string) => {
    const newErrors = { ...errors };

    if (field === "email") {
      newErrors.email = [];
      if (!value.trim()) {
        newErrors.email.push({ message: "Email is required" });
      } else if (!EMAIL_REGEX.test(value)) {
        newErrors.email.push({ message: "Invalid email format" });
      }
    }

    if (field === "password") {
      newErrors.password = [];
      if (!value.trim()) {
        newErrors.password.push({ message: "Password is required" });
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: LoginFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: LoginFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    validateField("email", formData.email);
    validateField("password", formData.password);

    const isLoggedIn = await api.login(formData.email, formData.password);
    if (isLoggedIn) onLogin();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={touched.email && errors.email.length !== 0}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={touched.email && errors.email.length !== 0}
              />
              <FieldError errors={errors.email} />
            </Field>

            <Field
              data-invalid={touched.password && errors.password.length !== 0}
            >
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href="/reset-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
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

            <Field>
              <Button type="submit">Login</Button>

              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link
                  className="cursor-pointer transition-colors duration-100"
                  href="/register"
                >
                  Sign up
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
