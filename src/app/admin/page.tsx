
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useCollection, useAuth, useUser, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Game = {
  id: string;
  name: string;
  phase: 'lobby' | 'assigning' | 'playing' | 'voting' | 'ended';
  createdAt: Timestamp;
};

function AdminConsoleContent() {
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const gamesRef = useMemoFirebase(() => collection(firestore, 'games'), [firestore]);
  const { data: games, isLoading: areGamesLoading } = useCollection<Omit<Game, 'id'>>(gamesRef);

  const [newGameName, setNewGameName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const sortedGames = useMemo(() => {
    if (!games) return [];
    // Sort games by creation date, newest first
    return [...games].sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }, [games]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim()) return;
    setIsCreating(true);
    try {
        const newGameData = {
            name: newGameName,
            phase: 'lobby',
            createdAt: serverTimestamp(),
        };
        const docRef = await addDocumentNonBlocking(gamesRef, newGameData);
        setNewGameName('');
        router.push(`/admin/${docRef.id}`);
    } catch (error) {
        console.error("Error creating game: ", error);
        // You could show a toast here
    } finally {
        setIsCreating(false);
    }
  };

  if (areGamesLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="font-code text-muted-foreground">LOADING GAME DIRECTORY...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between border-b-2 border-primary/20 pb-4 mb-6">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tighter text-primary sm:text-4xl">
            AURELIA_OS
            </h1>
            <p className="font-code text-accent">SYSTEM ADMINISTRATION CONSOLE</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </header>

      <div className="space-y-8">
        <section id="create-game">
          <h2 className="font-code text-lg text-primary/80 mb-2">> CREATE NEW GAME INSTANCE</h2>
          <form onSubmit={handleCreateGame} className="flex gap-2">
            <Input
              type="text"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              placeholder="New game name..."
              className="font-code bg-black/30 border-primary/30 focus:ring-accent"
              disabled={isCreating}
            />
            <Button type="submit" disabled={isCreating || !newGameName.trim()} className="font-code bg-primary hover:bg-primary/90 text-primary-foreground">
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'INITIATE'}
            </Button>
          </form>
        </section>

        <section id="game-list">
          <h2 className="font-code text-lg text-primary/80 mb-2">> SELECT EXISTING INSTANCE</h2>
          <div className="border-2 border-primary/20 bg-black/30 p-4 space-y-2 rounded-md max-h-96 overflow-y-auto">
            {sortedGames && sortedGames.length > 0 ? (
              sortedGames.map(game => (
                <Link key={game.id} href={`/admin/${game.id}`} passHref>
                  <div className="group flex items-center justify-between p-3 bg-background/50 hover:bg-primary/10 rounded-md transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <ChevronRight className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
                        <div className="font-code">
                            <p className="font-bold text-foreground">{game.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {game.id} // Created: {new Date(game.createdAt.seconds * 1000).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="mr-2"/>
                        Launch
                    </Button>
                  </div>
                </Link>
              ))
            ) : (
              <p className="font-code text-muted-foreground text-center p-4">NO GAME INSTANCES FOUND.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


export default function AdminPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-code">VERIFYING ADMIN CREDENTIALS...</p>
        </main>
        );
    }
    if (user.isAnonymous) {
        router.push('/');
        return (
            <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground font-code">ACCESS DENIED. REDIRECTING...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <AdminConsoleContent />
        </main>
    );
}
