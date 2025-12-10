'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyFragmentDisplay } from '@/components/game/KeyFragmentDisplay';
import { AureliaMessage } from '@/components/game/AureliaMessage';
import { useProgress } from '@/hooks/use-progress';
import { cn } from '@/lib/utils';
import { Lock, Play, CheckCircle, ShieldCheck, LogOut, Loader2 } from 'lucide-react';
import { ROOMS } from '@/lib/puzzles';
import {
  useAuth,
  useUser,
  useFirestore,
  useDoc,
  useMemoFirebase,
} from '@/firebase';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';

function HomePageContent() {
  const { progress, isNexusUnlocked, resetProgress } = useProgress();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const participantRef = useMemoFirebase(
    () => (user ? doc(firestore, 'participants', user.uid) : null),
    [user, firestore]
  );
  const { data: participant, isLoading: isParticipantLoading } = useDoc(participantRef);

  const isLoading = isUserLoading || isParticipantLoading;

  // Only handle *login/admin* routing here
  useEffect(() => {
    if (isUserLoading || isParticipantLoading) return;

    // Not logged in → login page
    if (!user) {
      router.replace('/login');
      return;
    }

    // Any non-anonymous user is an admin → admin console
    if (!user.isAnonymous) {
      router.replace('/admin');
      return;
    }
  }, [user, isUserLoading, isParticipantLoading, router]);

  const handleSignOut = async () => {
    if (!auth) return;
    await auth.signOut();
    resetProgress();
    router.push('/login');
  };

  // While auth/participant is loading or we’re redirecting, show a loader
  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  // At this point we know: user exists and is anonymous.
  // If they *don’t* have a displayName yet, gently block and send them to /welcome via a button.
  if (!participant?.displayName) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center space-y-3 max-w-md">
          <p className="text-lg font-semibold">Almost there…</p>
          <p className="text-sm text-muted-foreground">
            You need to confirm your designation before entering the Subterranean Enigma.
          </p>
          <Link href="/welcome">
            <Button>Confirm Your Designation</Button>
          </Link>
        </div>
      </main>
    );
  }

  // ✅ Fully ready: anonymous user with a displayName → show the game UI
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary sm:text-6xl md:text-7xl">
              Subterranean Enigma
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Welcome, {participant.displayName}.
            </p>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>

        <AureliaMessage
          text={`Designation "${participant.displayName}" confirmed. Access to subroutine sectors is... provisional. Proceed.`}
        />

        <section>
          <h2 className="mb-4 text-center font-headline text-3xl font-bold text-primary/80">
            Storyline Sectors
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {Object.values(ROOMS).map((room) => {
              const isCompleted = progress.keys[room.id];
              return (
                <Card
                  key={room.id}
                  className={cn(
                    'group transform-gpu overflow-hidden border-2 border-primary/10 bg-card/50 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10',
                    isCompleted && 'border-accent/50'
                  )}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <room.icon className="h-10 w-10 text-primary" />
                    <div>
                      <CardTitle className="font-headline text-2xl">{room.name}</CardTitle>
                      <CardDescription className="mt-1">{room.theme}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{room.description}</p>
                    <Link href={`/${room.id}`} passHref>
                      <Button className="w-full">
                        {isCompleted ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Enter Sector
                          </>
                        )}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border-2 border-dashed border-primary/20 bg-card/30 p-6">
          <h2 className="mb-4 text-center font-headline text-2xl font-bold text-primary/80">
            Nexus Key Fragments
          </h2>
          <KeyFragmentDisplay keys={progress.keys} />
          <div className="mt-6 text-center">
            <Link href="/nexus" passHref>
              <Button
                size="lg"
                disabled={!isNexusUnlocked}
                aria-label={isNexusUnlocked ? 'Enter Nexus Convergence' : 'Nexus Locked'}
              >
                {isNexusUnlocked ? (
                  <ShieldCheck className="mr-2 h-5 w-5" />
                ) : (
                  <Lock className="mr-2 h-5 w-5" />
                )}
                {isNexusUnlocked ? 'Enter Nexus Convergence' : 'Nexus Locked'}
              </Button>
            </Link>
          </div>
        </section>

        <footer className="text-center">
          <Button variant="ghost" size="sm" onClick={resetProgress}>
            Reset Progress
          </Button>
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
  return (
      <HomePageContent />
  );
}
