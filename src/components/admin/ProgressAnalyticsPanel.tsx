'use client';

import React from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { doc } from 'firebase/firestore';

// Define the shape of a single participant passed in props
type Participant = {
  id: string; // This is the user's UID
  participantCode: string;
  gameId: string;
};

// Define the shape of the gameState document
type GameState = {
  id: string;
  participantUserId: string;
  archiveComplete?: boolean;
  wellComplete?: boolean;
  networkComplete?: boolean;
};

// Component for a single participant's row
const ParticipantProgressRow: React.FC<{ participant: Participant }> = ({ participant }) => {
  const firestore = useFirestore();

  // Create a memoized reference to the participant's gameState document
  const gameStateRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'participants', participant.id, 'gameState', 'main') : null),
    [firestore, participant.id]
  );

  // Use the useDoc hook to get real-time updates for the gameState
  const { data: gameState, isLoading } = useDoc<GameState>(gameStateRef);

  if (isLoading) {
    return (
      <TableRow>
        <TableCell className="font-mono text-xs">{participant.participantCode}</TableCell>
        <TableCell colSpan={3} className="text-center">
          <Loader2 className="h-4 w-4 animate-spin inline-block" />
        </TableCell>
      </TableRow>
    );
  }

  const renderStatus = (isComplete: boolean | undefined) => {
    return isComplete ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-muted-foreground/50" />
    );
  };

  return (
    <TableRow>
      <TableCell className="font-semibold">{participant.participantCode}</TableCell>
      <TableCell className="text-center">{renderStatus(gameState?.archiveComplete)}</TableCell>
      <TableCell className="text-center">{renderStatus(gameState?.wellComplete)}</TableCell>
      <TableCell className="text-center">{renderStatus(gameState?.networkComplete)}</TableCell>
    </TableRow>
  );
};


interface ProgressAnalyticsPanelProps {
  participants: Participant[] | null;
}

export const ProgressAnalyticsPanel: React.FC<ProgressAnalyticsPanelProps> = ({ participants }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Progress Analytics</CardTitle>
        <CardDescription>
          Real-time view of each participant's storyline completion.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(!participants || participants.length === 0) ? (
          <p className="text-center text-sm text-muted-foreground pt-4">
            No active participants have joined this game yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant Code</TableHead>
                <TableHead className="text-center">Archive</TableHead>
                <TableHead className="text-center">Well</TableHead>
                <TableHead className="text-center">Network</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((p) => (
                <ParticipantProgressRow key={p.id} participant={p} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
