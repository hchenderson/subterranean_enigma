
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useAuth } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';


type GamePhase =
  | 'lobby'
  | 'assigning'
  | 'playing'
  | 'voting'
  | 'ended';

type Game = {
  id: string;
  name: string;
  phase: GamePhase;
  createdAt?: number;
};

type Team = {
  id: string;
  name: string;
  color?: string;
};

type Player = {
  id: string;
  displayName: string;
  teamId: string | null;
};

type AdminPageProps = {
  params: { gameId: string };
};

function AdminGamePageContent({ params, onSignOut }: AdminPageProps & { onSignOut: () => void }) {
    const { gameId } = params;
    const firestore = useFirestore();

    const gameRef = useMemoFirebase(() => gameId ? doc(firestore, 'games', gameId) : null, [firestore, gameId]);
    const { data: game, isLoading: isGameLoading } = useDoc<Omit<Game, 'id'>>(gameRef);

    const teamsRef = useMemoFirebase(() => gameId ? collection(firestore, 'games', gameId, 'teams') : null, [firestore, gameId]);
    const { data: teams, isLoading: areTeamsLoading } = useCollection<Omit<Team, 'id'>>(teamsRef);

    const playersRef = useMemoFirebase(() => gameId ? collection(firestore, 'games', gameId, 'players') : null, [firestore, gameId]);
    const { data: players, isLoading: arePlayersLoading } = useCollection<Omit<Player, 'id'>>(playersRef);

    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

  const playersByTeam = useMemo(() => {
    if (!teams || !players) return {};
    const map: Record<string, Player[]> = {};
    for (const team of teams) {
      map[team.id] = [];
    }
    for (const p of players) {
      if (!p.teamId) continue;
      if (!map[p.teamId]) map[p.teamId] = [];
      map[p.teamId].push(p);
    }
    return map;
  }, [teams, players]);

  // ---- Admin actions ----

  function updatePlayerTeam(playerId: string, teamId: string | null) {
    if (!gameId) return;
    const ref = doc(firestore, 'games', gameId, 'players', playerId);
    updateDocumentNonBlocking(ref, { teamId });
  }

  function changeGamePhase(nextPhase: GamePhase) {
    if (!game) return;
    const gameRef = doc(firestore, 'games', gameId);
    updateDocumentNonBlocking(gameRef, { phase: nextPhase });
  }

  // ---- UI helpers ----

  const phaseOptions: GamePhase[] = [
    'lobby',
    'assigning',
    'playing',
    'voting',
    'ended',
  ];
  
  const isLoading = isGameLoading || areTeamsLoading || arePlayersLoading;

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading Game Data...</p>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">No game found</p>
          <p className="text-sm text-slate-400">
            Make sure the game ID in the URL matches a document in <code>games/{'{gameId}'}</code>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-primary">
              Admin Control — {game.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Game ID:{' '}
              <span className="font-mono">{game.id}</span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-4 md:items-end">
             <Button variant="ghost" onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Phase
              </span>
              <select
                className="rounded border border-border bg-background px-3 py-1 text-sm"
                value={game.phase}
                onChange={(e) =>
                  changeGamePhase(e.target.value as GamePhase)
                }
                disabled={isUpdating}
              >
                {phaseOptions.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded border border-red-500 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Teams & players */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(teams ?? []).map((team) => {
            const teamPlayers = playersByTeam[team.id] ?? [];

            return (
              <div
                key={team.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold">
                      {team.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {teamPlayers.length} players
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {teamPlayers.length === 0 && (
                    <p className="text-xs text-muted-foreground/50">
                      No players in this team yet.
                    </p>
                  )}

                  {teamPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="rounded border border-border bg-background/60 px-2 py-2 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {player.displayName}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                          {player.id}
                        </span>
                      </div>

                      <div className="mt-1 space-y-1">
                        <label className="block text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          Move to team
                        </label>
                        <select
                          className="w-full rounded border border-input bg-background px-2 py-1 text-[11px]"
                          value={player.teamId ?? ''}
                          onChange={(e) =>
                            updatePlayerTeam(
                              player.id,
                              e.target.value === ''
                                ? null
                                : e.target.value,
                            )
                          }
                          disabled={isUpdating}
                        >
                          <option value="">No team</option>
                          {(teams ?? []).map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Global player inspector */}
        <section className="mt-4 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold mb-2">
            All players (overview)
          </h2>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="text-left py-1 pr-2">Name</th>
                  <th className="text-left py-1 px-2">Team</th>
                </tr>
              </thead>
              <tbody>
                {(players ?? []).map((p) => {
                  const team = (teams ?? []).find((t) => t.id === p.teamId);
                  return (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-1 pr-2">
                        {p.displayName}
                      </td>
                      <td className="py-1 px-2">
                        {team ? (
                          team.name
                        ) : (
                          <span className="text-muted-foreground/50">
                            None
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}


export default function AdminGamePage({ params }: AdminPageProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    );
  }
  // We check if the user is an admin or not.
  // Note: for this app, we consider any non-anonymous user to be an admin.
  if (user.isAnonymous) {
      router.push('/');
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
        );
  }

  return <AdminGamePageContent params={params} onSignOut={handleSignOut} />;
}
