'use client';

import React, { useState, useMemo } from 'react';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  arrayUnion,
} from 'firebase/firestore';
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  updateDocumentNonBlocking,
} from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

type Hint = {
  id: string;
  puzzleKey: string;
  team: string;
  order: number;
  text: string;
  revealedFor: string[];
};

type Team = {
  id: string;
  name: string;
};

interface HintsPanelProps {
  gameId: string;
  teams: Team[] | null;
}

export const HintsPanel: React.FC<HintsPanelProps> = ({ gameId, teams }) => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isRevealing, setIsRevealing] = useState<string | null>(null);

  const hintsRef = useMemoFirebase(
    () =>
      gameId
        ? query(collection(firestore, 'games', gameId, 'hints'), orderBy('order'))
        : null,
    [firestore, gameId]
  );
  const { data: hints, isLoading } = useCollection<Omit<Hint, 'id'>>(hintsRef);

  const hintsByPuzzle = useMemo(() => {
    if (!hints) return {};
    return hints.reduce((acc, hint) => {
      const key = hint.puzzleKey;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(hint);
      return acc;
    }, {} as Record<string, Hint[]>);
  }, [hints]);

  const handleRevealHint = async (hint: Hint, teamId: string) => {
    if (!firestore || !gameId) return;

    const revealId = `${hint.id}-${teamId}`;
    setIsRevealing(revealId);

    try {
      const hintRef = doc(firestore, 'games', gameId, 'hints', hint.id);
      // This is an admin-only action, so we use a non-blocking update
      // for a better UX in the admin panel.
      updateDocumentNonBlocking(hintRef, {
        revealedFor: arrayUnion(teamId),
      });

      toast({
        title: 'Hint Revealed',
        description: `Hint #${hint.order} for puzzle "${hint.puzzleKey}" sent to team.`,
      });
    } catch (error) {
      console.error('Error revealing hint:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not reveal the hint. Please check permissions.',
      });
    } finally {
      setIsRevealing(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hint Control Panel</CardTitle>
        <CardDescription>
          Reveal hints to teams. Revealed hints cannot be hidden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <p className="text-muted-foreground">Loading hint database...</p>
          </div>
        )}

        {!isLoading && Object.keys(hintsByPuzzle).length === 0 && (
          <p className="text-center text-sm text-muted-foreground pt-4">
            No hints have been configured for this game yet.
          </p>
        )}

        <Accordion type="single" collapsible className="w-full">
          {Object.entries(hintsByPuzzle).map(([puzzleKey, puzzleHints]) => (
            <AccordionItem key={puzzleKey} value={puzzleKey}>
              <AccordionTrigger className="text-lg font-semibold">
                {puzzleKey}
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                {puzzleHints.map((hint) => (
                  <div key={hint.id} className="p-3 border rounded-md bg-background/50">
                    <p className="font-medium">
                      Hint #{hint.order}: <span className="font-normal italic">"{hint.text}"</span>
                    </p>
                    <div className="mt-3">
                      <h4 className="text-xs uppercase text-muted-foreground mb-2">Reveal to Team</h4>
                      <div className="flex flex-wrap gap-2">
                        {teams?.map((team) => {
                          const isRevealed = hint.revealedFor?.includes(team.id);
                          const revealId = `${hint.id}-${team.id}`;
                          return (
                            <Button
                              key={team.id}
                              variant={isRevealed ? 'secondary' : 'outline'}
                              size="sm"
                              onClick={() => handleRevealHint(hint, team.id)}
                              disabled={isRevealed || !!isRevealing}
                            >
                              {isRevealing === revealId ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : !isRevealed && (
                                <Send className="mr-2 h-4 w-4" />
                              )}
                              {team.name}
                            </Button>
                          );
                        })}
                      </div>
                       {hint.revealedFor?.length > 0 &&
                        <div className="mt-3">
                            <h4 className="text-xs uppercase text-muted-foreground mb-1">Revealed For</h4>
                            <div className="flex flex-wrap gap-1">
                            {hint.revealedFor.map(teamId => {
                                const team = teams?.find(t => t.id === teamId);
                                return <Badge key={teamId} variant="secondary">{team?.name || teamId}</Badge>
                            })}
                            </div>
                        </div>
                       }
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
