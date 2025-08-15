"use client";
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Provider as JotaiProvider} from "jotai"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <JotaiProvider>
      {children}
      </JotaiProvider>
    </SessionProvider>
  );
};