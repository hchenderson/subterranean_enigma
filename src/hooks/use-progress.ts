"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { RoomId, GameProgress, KeyFragments } from '@/lib/types';
import { useToast } from './use-toast';

const PROGRESS_KEY = 'subterranean-enigma-progress';

const DEFAULT_PROGRESS: GameProgress = {
  keys: {
    archive: false,
    well: false,
    network: false,
  },
};

export function useProgress() {
  const [progress, setProgress] = useState<GameProgress>(DEFAULT_PROGRESS);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedProgress = window.localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveProgress = useCallback((newProgress: GameProgress) => {
    try {
      setProgress(newProgress);
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error("Failed to save progress to localStorage", error);
    }
  }, []);

  const collectKey = useCallback((roomId: RoomId) => {
    if (progress.keys[roomId]) return; // Already have this key

    const newProgress = {
      ...progress,
      keys: {
        ...progress.keys,
        [roomId]: true,
      },
    };
    saveProgress(newProgress);
    toast({
      title: "Key Fragment Acquired",
      description: `You have obtained the ${roomId.toUpperCase()}-KEY FRAGMENT.`,
    });
  }, [progress, saveProgress, toast]);

  const resetProgress = useCallback(() => {
    saveProgress(DEFAULT_PROGRESS);
    toast({
      title: "Progress Reset",
      description: "Your journey into the megastructure has been reset.",
    });
  }, [saveProgress, toast]);

  const isNexusUnlocked = useMemo(() => {
    return Object.values(progress.keys).every(Boolean);
  }, [progress.keys]);

  return {
    progress,
    isLoaded,
    collectKey,
    resetProgress,
    isNexusUnlocked,
  };
}
