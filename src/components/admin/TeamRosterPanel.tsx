
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Users, User, HelpCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

type Participant = {
  id: string;
  displayName: string;
  teamId: string | null;
};

type Team = {
  id: string;
  name: string;
};

interface TeamRosterPanelProps {
  participants: Participant[] | null;
  teams: Team[] | null;
}

export const TeamRosterPanel: React.FC<TeamRosterPanelProps> = ({
  participants,
  teams,
}) => {
  const firestore = useFirestore();

  const handleTeamChange = (participantId: string, newTeamId: string) => {
    if (!firestore) return;
    const participantRef = doc(firestore, 'participants', participantId);
    // The "null" teamId is stored as the string 'unassigned' in the dropdown.
    const finalTeamId = newTeamId === 'unassigned' ? null : newTeamId;
    updateDocumentNonBlocking(participantRef, { teamId: finalTeamId });
  };

  const unassignedParticipants =
    participants?.filter((p) => !p.teamId) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users />
          Teams & Players
        </CardTitle>
        <CardDescription>
          Assign participants to teams. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams?.map((team) => {
            const teamMembers =
              participants?.filter((p) => p.teamId === team.id) || [];
            return (
              <div key={team.id} className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold text-primary">{team.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {teamMembers.length} member{teamMembers.length !== 1 && 's'}
                </p>
                <div className="space-y-2">
                  {teamMembers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" /> {p.displayName}
                      </span>
                    </div>
                  ))}
                  {teamMembers.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No members yet.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <HelpCircle />
            Unassigned Participants ({unassignedParticipants.length})
          </h3>
          {unassignedParticipants.length > 0 ? (
            <div className="space-y-2 rounded-md border p-2">
              {unassignedParticipants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 p-2 bg-background rounded"
                >
                  <span className="font-medium">{p.displayName}</span>
                  <Select
                    value={p.teamId || 'unassigned'}
                    onValueChange={(newTeamId) =>
                      handleTeamChange(p.id, newTeamId)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Assign team..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {teams?.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              All active participants have been assigned to a team.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

    