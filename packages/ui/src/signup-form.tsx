"use client";
import { Button } from "./common/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./common/field";
import { Input } from "./common/input";
import { Api } from "@repo/lib/api/api";
import { cn } from "@repo/lib/cn";
import { LinkComp } from "@repo/lib/types/link-comp";
import { Navigate } from "@repo/lib/types/navigate";
import { EMAIL_REGEX } from "@repo/lib/utils/regex";
import { FormEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./common/card";

export function SignupForm({
  className,
  api,
  LinkComp: Link,
  navigate,
}: {
  className?: string;
  api: Api;
  navigate: Navigate;
  LinkComp: LinkComp;
}) {
  type SignupFields = "name" | "email" | "password" | "confirmPassword";

  const [touched, setTouched] = useState<
    Partial<Record<SignupFields, boolean>>
  >({});
  const [errors, setErrors] = useState<
    Record<SignupFields, { message?: string }[]>
  >({
    name: [],
    email: [],
    password: [],
    confirmPassword: [],
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateField = (field: SignupFields, value: string): boolean => {
    const newErrors = { ...errors };

    if (field === "name") {
      newErrors.name = [];
      if (!value.trim()) {
        newErrors.name.push({ message: "Username is required" });
      } else if (value.trim().length < 2) {
        newErrors.name.push({
          message: "Username must be at least 2 characters",
        });
      }
    }

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

  const handleBlur = (field: SignupFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleChange = (field: SignupFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    let err = true;
    err &&= validateField("name", formData.name);
    err &&= validateField("email", formData.email);
    err &&= validateField("password", formData.password);
    err &&= validateField("confirmPassword", formData.confirmPassword);

    if (!err) return;

    const { isOk } = await api.sendRequest(
      "/users/register",
      {
        method: "post",
        payload: {
          email: formData.email,
          username: formData.name,
          password: formData.password,
        },
      },
      {
        toasts: {
          success: "Account created successfully!",
          loading: "Creating your account...",
          error: (e) =>
            e.message || "An error occurred while creating your account.",
        },
      },
    );

    if (!isOk) return;
    navigate("/login");
  };

  return (
    <Card
      className={cn(
        "max-h-[70vh] w-full max-w-[90vw] sm:w-auto sm:min-w-lg",
        className,
      )}
    >
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent className="overflow-auto">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={touched.name && errors.name.length !== 0}>
              <FieldLabel htmlFor="name">Username</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                aria-invalid={touched.name && errors.name.length !== 0}
              />
              <FieldError errors={errors.name} />
            </Field>
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
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleBlur("confirmPassword")}
                aria-invalid={
                  touched.confirmPassword && errors.confirmPassword.length !== 0
                }
              />
              <FieldError errors={errors.confirmPassword} />
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account?{" "}
                  <Link
                    className="cursor-pointer transition-colors duration-100"
                    href="/login"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
