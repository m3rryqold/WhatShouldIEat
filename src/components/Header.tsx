import { UtensilsCrossed } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center gap-3">
        <UtensilsCrossed className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary tracking-tight">WhatShouldIEat</h1>
      </div>
    </header>
  );
}
