'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase, useAuth, useUser } from '@/firebase';
import { updateDocumentNonBlocking, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, LogOut, PlusCircle, Copy, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateParticipantCode } from '@/ai/generate-participant-code';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PrintMaterialsPanel } from '@/components/admin/PrintMaterialsPanel';
import { HintsPanel } from '@/components/admin/HintsPanel';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


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
  isJoinable?: boolean;
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

type Participant = {
    id: string;
    participantCode: string;
};

function AdminGamePageContent({ gameId, onSignOut }: { gameId: string, onSignOut: () => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const gameRef = useMemoFirebase(() => gameId ? doc(firestore, 'games', gameId) : null, [firestore, gameId]);
    const { data: game, isLoading: isGameLoading } = useDoc<Omit<Game, 'id'>>(gameRef);

    const teamsRef = useMemoFirebase(() => gameId ? collection(firestore, 'games', gameId, 'teams') : null, [firestore, gameId]);
    const { data: teams, isLoading: areTeamsLoading } = useCollection<Omit<Team, 'id'>>(teamsRef);

    const playersRef = useMemoFirebase(() => gameId ? collection(firestore, 'games', gameId, 'players') : null, [firestore, gameId]);
    const { data: players, isLoading: arePlayersLoading } = useCollection<Omit<Player, 'id'>>(playersRef);
    
    const participantsRef = useMemoFirebase(() => gameId ? collection(firestore, 'games', gameId, 'participants') : null, [firestore, gameId]);
    const { data: participants, isLoading: areParticipantsLoading } = useCollection<Omit<Participant, 'id'>>(participantsRef);


    const [isUpdating, setIsUpdating] = useState(false);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
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
    if (!gameId || !firestore) return;
    const ref = doc(firestore, 'games', gameId, 'players', playerId);
    updateDocumentNonBlocking(ref, { teamId });
  }

  function changeGamePhase(nextPhase: GamePhase) {
    if (!game || !firestore) return;
    const gameRef = doc(firestore, 'games', gameId);
    updateDocumentNonBlocking(gameRef, { phase: nextPhase });
  }

  function toggleJoinable(isJoinable: boolean) {
    if (!gameRef) return;
    // We use setDoc here to ensure it's a non-blocking UI update for the admin
    setDocumentNonBlocking(gameRef, { isJoinable }, { merge: true });
     toast({
        title: `Game is now ${isJoinable ? 'joinable' : 'closed'}`,
        description: isJoinable
          ? 'Participants can now join using a valid code.'
          : 'New participants can no longer join this game.',
      });
  }

  async function handleGenerateCode() {
    if (!participantsRef) return;
    setIsGeneratingCode(true);
    try {
        const { code } = await generateParticipantCode();
        if (code) {
            await addDoc(participantsRef, { participantCode: code.toUpperCase() });
            toast({
                title: "Code Generated",
                description: `New participant code "${code.toUpperCase()}" has been created.`,
            });
        } else {
            throw new Error("Failed to generate code.");
        }
    } catch (err) {
        console.error("Failed to generate participant code", err);
        setError("Could not generate a new participant code. Please try again.");
    } finally {
        setIsGeneratingCode(false);
    }
  }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        toast({
        title: "Copied!",
        description: `Code "${text}" copied to clipboard.`,
        });
    }

  // ---- UI helpers ----

  const phaseOptions: GamePhase[] = [
    'lobby',
    'assigning',
    'playing',
    'voting',
    'ended',
  ];
  
  const isLoading = isGameLoading || areTeamsLoading || arePlayersLoading || areParticipantsLoading;

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
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">No game found</p>
          <p className="text-sm text-muted-foreground">
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
              <span className="font-mono">{gameId}</span>
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

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                
                <section>
                    <HintsPanel gameId={gameId} teams={teams} />
                </section>

                <section>
                    <PrintMaterialsPanel gameId={gameId} />
                </section>

                {/* Global player inspector */}
                <section className="rounded-xl border border-border bg-card p-4">
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
            
            {/* Right column for participant codes and game status */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Game Status</CardTitle>
                        <CardDescription>Control whether new participants can join this game instance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 rounded-lg border p-4" >
                            <Switch 
                                id="joinable-switch" 
                                checked={!!game.isJoinable}
                                onCheckedChange={toggleJoinable}
                            />
                            <Label htmlFor="joinable-switch" className="flex flex-col">
                                <span>{game.isJoinable ? "Game is Joinable" : "Game is Closed"}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {game.isJoinable ? <Power className="h-4 w-4 text-green-500 inline mr-1"/> : <PowerOff className="h-4 w-4 text-red-500 inline mr-1"/>}
                                    {game.isJoinable ? "Participants can join." : "New joins are blocked."}
                                </span>
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Participant Codes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button onClick={handleGenerateCode} disabled={isGeneratingCode || !game.isJoinable} className="w-full">
                            {isGeneratingCode ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                            Generate New Code
                        </Button>
                        {!game.isJoinable && <p className="text-xs text-center text-amber-500">Enable "Game is Joinable" to generate new codes.</p>}

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {participants && participants.length > 0 ? (
                                participants.map(p => (
                                    <div key={p.id} className="flex items-center justify-between bg-background p-2 rounded-md">
                                        <span className="font-mono text-sm">{p.participantCode}</span>
                                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(p.participantCode)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-muted-foreground pt-4">No participant codes generated yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </main>
  );
}


export default function AdminGamePage() {
  const params = useParams<{ gameId: string }>();
  const gameId = params.gameId;
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (!auth) return;
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

  return <AdminGamePageContent gameId={gameId} onSignOut={handleSignOut} />;
}
