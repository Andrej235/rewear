"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { JSX } from "react";

const queryClient = new QueryClient();

export function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
