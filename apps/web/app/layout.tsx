import { Toaster } from "@repo/ui/common/sonner";
import "@repo/ui/globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Roboto, Roboto_Slab } from "next/font/google";
import { ReactNode } from "react";
import { QueryProvider } from "../components/query-provider";
import "../lib/api.client";
import "../lib/api.server";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    absolute: "Your Wardrobe, On Demand - ReWear",
    template: "%s - ReWear",
  },
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${robotoSlab.variable} antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>

          <Toaster richColors />
        </QueryProvider>

        <Analytics />
      </body>
    </html>
  );
}
