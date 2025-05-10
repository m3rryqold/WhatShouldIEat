import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'WhatShouldIEat',
  description: 'Smart meal suggestions for a healthier you.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-foreground`}>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster />
        </div>
      </body>
    </html>
  );
}
