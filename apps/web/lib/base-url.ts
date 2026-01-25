export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "")!; // Remove trailing slash
if (!baseUrl)
  throw new Error("Missing NEXT_PUBLIC_BASE_URL environment variable");
