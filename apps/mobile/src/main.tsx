import "@repo/ui/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { App } from "./app";
import { AppLayer } from "./components/pages/app-layer";
import { AuthLayer } from "./components/pages/auth-layer";
import { HomePage } from "./components/pages/home-page";
import { LoginPage } from "./components/pages/login-page";
import { RegisterPage } from "./components/pages/register-page";
import { ResetPasswordPage } from "./components/pages/reset-password-page";
import { VerifyEmailPage } from "./components/pages/verify-email-page";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/",
        Component: HomePage,
      },
      {
        Component: AppLayer,
        children: [
          {
            path: "/verify-email",
            Component: VerifyEmailPage,
          },
        ],
      },
      {
        Component: AuthLayer,
        children: [
          {
            path: "/login",
            Component: LoginPage,
          },
          {
            path: "/register",
            Component: RegisterPage,
          },
          {
            path: "/reset-password",
            Component: ResetPasswordPage,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
