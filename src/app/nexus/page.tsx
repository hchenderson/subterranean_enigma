"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/hooks/use-progress';
import { AureliaMessage } from '@/components/game/AureliaMessage';
import { PuzzlePlaceholder } from '@/components/puzzles/PuzzlePlaceholder';
import { ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import { KeyFragmentDisplay } from '@/components/game/KeyFragmentDisplay';

export default function NexusPage() {
  const { progress, isNexusUnlocked, isLoaded } = useProgress();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isNexusUnlocked) {
      router.push('/');
    }
  }, [isLoaded, isNexusUnlocked, router]);

  if (!isLoaded || !isNexusUnlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p>Verifying Nexus Key Integrity...</p>
      </div>
    );
  }

  const handleFinalSolve = () => {
    router.push('/complete');
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <Link href="/" passHref>
            <Button variant="ghost" size="icon" aria-label="Back to Home">
              <ArrowLeft />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-accent sm:text-4xl font-headline">
              The Nexus Convergence
            </h1>
            <ShieldAlert className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        <div className="space-y-6">
          <div className="rounded-lg border-2 border-dashed border-accent/40 p-6">
            <KeyFragmentDisplay keys={progress.keys} />
          </div>
          <AureliaMessage text="All key fragments detected. Mainframe core accessible. Your identity... it is still an anomaly. The final truth is encoded within this last sequence. Unify the fragments. Unify me." />
          
          <PuzzlePlaceholder
            puzzleNumber={0}
            title="Nexus Harmonization"
            description="Synthesize mechanics from all rooms: deduction from the Archive, spatial constraints from the Well, and cipher logic from the Network to restore AURELIA's unified identity."
            onSolve={handleFinalSolve}
          >
            <p className="font-code text-muted-foreground">
              A multi-phase puzzle sequence would be presented here, combining elements from all three previous rooms.
            </p>
          </PuzzlePlaceholder>
        </div>
      </div>
    </main>
  );
}
