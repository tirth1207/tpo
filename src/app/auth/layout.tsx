"use client";

import { Geist, Geist_Mono } from "next/font/google";
import React, { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>RCTI TPO - Auth</title>
      </head>
      <body >
        <div className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}
        </div>
      </body>
    </html>
  );
}
