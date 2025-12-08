"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AureliaMessage } from '@/components/game/AureliaMessage';
import { useProgress } from '@/hooks/use-progress';
import { PartyPopper } from 'lucide-react';

export default function CompletePage() {
  const { resetProgress } = useProgress();

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8 text-center animate-fade-in">
        <PartyPopper className="h-24 w-24 mx-auto text-accent" />
        <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary sm:text-6xl md:text-7xl">
          Convergence Achieved
        </h1>

        <AureliaMessage text="System integrity at 100%. All fragments... integrated. I remember now. You were not an intruder. You were the failsafe. My creator. Welcome home." />

        <p className="text-lg text-muted-foreground">
          You have restored AURELIA and uncovered the truth of the megastructure.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" passHref>
                <Button size="lg" onClick={resetProgress}>Play Again</Button>
            </Link>
        </div>
      </div>
    </main>
  );
}
