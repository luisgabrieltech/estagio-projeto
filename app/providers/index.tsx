"use client";
import { SessionProvider } from "./session-provider";
import { QueryProvider } from "@/lib/query/providers/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>{children}</SessionProvider>
    </QueryProvider>
  );
}
