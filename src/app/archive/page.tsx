"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useProgress } from '@/hooks/use-progress';
import { PuzzlePlaceholder } from '@/components/puzzles/PuzzlePlaceholder';
import { AureliaMessage } from '@/components/game/AureliaMessage';
import { PUZZLE_DATA, ROOMS } from '@/lib/puzzles';
import { ArchiveIcon } from '@/components/icons/ArchiveIcon';
import { KeyIcon } from '@/components/icons/KeyIcon';
import { ArrowLeft } from 'lucide-react';

const ROOM_ID = 'archive';
const roomData = ROOMS[ROOM_ID];
const puzzles = PUZZLE_DATA[ROOM_ID];

export default function ArchivePage() {
  const { progress, collectKey, completeStoryline, isLoaded } = useProgress();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);

  const handleSolve = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
    } else {
      // Mark storyline as complete and collect the key
      completeStoryline(ROOM_ID);
      collectKey(ROOM_ID);
    }
  };

  const hasKey = progress.keys[ROOM_ID];

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
            <h1 className="text-3xl font-bold text-primary sm:text-4xl font-headline">
              {roomData.name}
            </h1>
            <roomData.icon className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        {isLoaded && (
          hasKey ? (
            <div className="text-center space-y-6 p-8 bg-card/50 rounded-lg animate-fade-in">
              <KeyIcon className="h-16 w-16 mx-auto text-accent" />
              <h2 className="text-3xl font-bold text-accent">Sector Cleared</h2>
              <p className="text-muted-foreground">You have recovered the {roomData.keyName} fragment from the Archive's depths. The echoes settle into silence.</p>
              <AureliaMessage text="Log integrity restored. Chronological anomalies resolved. A fragment of the master key... an interesting development." />
              <Link href="/" passHref>
                <Button>Return to Sector Selection</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <AureliaMessage text="The Archive of Echoes... data streams are fragmented, timelines overlap. Restore coherence to proceed." />
              <PuzzlePlaceholder
                puzzleNumber={currentPuzzleIndex + 1}
                title={puzzles[currentPuzzleIndex].title}
                description={puzzles[currentPuzzleIndex].description}
                onSolve={handleSolve}
              />
            </div>
          )
        )}
      </div>
    </main>
  );
}
