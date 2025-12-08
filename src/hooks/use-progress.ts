"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { RoomId, GameProgress } from '@/lib/types';
import { useToast } from './use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

const DEFAULT_PROGRESS: GameProgress = {
  keys: {
    archive: false,
    well: false,
    network: false,
  },
  completion: {
    archive: false,
    well: false,
    network: false,
  }
};

export function useProgress() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const gameStateRef = useMemoFirebase(
    () => (user ? doc(firestore, 'participants', user.uid, 'gameState', 'main') : null),
    [user, firestore]
  );
  
  const { data: progress, isLoading: isProgressLoading, error } = useDoc<GameProgress>(gameStateRef);

  const isLoaded = !isProgressLoading && progress !== null;
  
  useEffect(() => {
    if (error) {
        console.error("Error loading game progress:", error);
        toast({
            variant: 'destructive',
            title: 'Error Loading Progress',
            description: 'Could not load your game state. Please try refreshing the page.'
        })
    }
  }, [error, toast]);


  const completeStoryline = useCallback((roomId: RoomId) => {
    if (!gameStateRef || progress?.completion[roomId]) return;

    const newCompletionState = {
        ...progress.completion,
        [roomId]: true,
    }

    updateDocumentNonBlocking(gameStateRef, {
        completion: newCompletionState
    });

  }, [gameStateRef, progress]);


  const collectKey = useCallback((roomId: RoomId) => {
    if (!gameStateRef || progress?.keys[roomId]) return;

     const newKeyState = {
        ...progress.keys,
        [roomId]: true,
    };
    const newCompletionState = {
        ...progress.completion,
        [roomId]: true,
    }

    updateDocumentNonBlocking(gameStateRef, {
        keys: newKeyState,
        completion: newCompletionState
    });

    toast({
      title: "Key Fragment Acquired",
      description: `You have obtained the ${roomId.toUpperCase()}-KEY FRAGMENT.`,
    });
  }, [gameStateRef, progress, toast]);


  const resetProgress = useCallback(() => {
    if (!gameStateRef) return;
    
    const resetState = {
        keys: DEFAULT_PROGRESS.keys,
        completion: DEFAULT_PROGRESS.completion,
        archiveComplete: false, // for legacy analytics compatibility
        wellComplete: false,
        networkComplete: false,
    }
    
    setDocumentNonBlocking(gameStateRef, resetState, { merge: false });

    toast({
      title: "Progress Reset",
      description: "Your journey into the megastructure has been reset.",
    });
  }, [gameStateRef, toast]);


  const isNexusUnlocked = useMemo(() => {
    return !!progress && Object.values(progress.keys).every(Boolean);
  }, [progress]);

  return {
    progress: progress ?? DEFAULT_PROGRESS,
    isLoaded,
    collectKey,
    completeStoryline,
    resetProgress,
    isNexusUnlocked,
  };
}
