"use client";

import { cn } from "@/lib/utils";
import type { KeyFragments } from "@/lib/types";
import { KeyIcon } from "@/components/icons/KeyIcon";
import { ROOMS } from "@/lib/puzzles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface KeyFragmentDisplayProps {
  keys: KeyFragments;
}

export function KeyFragmentDisplay({ keys }: KeyFragmentDisplayProps) {
  return (
    <TooltipProvider>
      <div className="flex justify-center items-center gap-6 sm:gap-10">
        {Object.values(ROOMS).map((room) => (
          <Tooltip key={room.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex flex-col items-center gap-2 transition-all duration-500",
                  keys[room.id] ? "opacity-100" : "opacity-30"
                )}
              >
                <div
                  className={cn(
                    "relative rounded-full p-4 border-2 ",
                    keys[room.id] ? "bg-accent/10 border-accent" : "bg-muted/10 border-primary/20"
                  )}
                >
                  <KeyIcon className={cn("h-8 w-8 sm:h-10 sm:w-10", keys[room.id] ? "text-accent" : "text-primary/50")} />
                  {keys[room.id] && <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />}
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase">
                  {room.keyName}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{keys[room.id] ? "Fragment Acquired" : "Fragment Missing"}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
