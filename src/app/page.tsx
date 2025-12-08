"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArchiveIcon } from '@/components/icons/ArchiveIcon';
import { WellIcon } from '@/components/icons/WellIcon';
import { NetworkIcon } from '@/components/icons/NetworkIcon';
import { KeyFragmentDisplay } from '@/components/game/KeyFragmentDisplay';
import { AureliaMessage } from '@/components/game/AureliaMessage';
import { useProgress } from '@/hooks/use-progress';
import { cn } from '@/lib/utils';
import { Lock, Play, CheckCircle, ShieldCheck, LogOut, Loader2 } from 'lucide-react';
import { ROOMS } from '@/lib/puzzles';
import { FirebaseClientProvider, useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


function HomePageContent() {
  const { progress, isNexusUnlocked, resetProgress } = useProgress();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.isAnonymous) {
        // If the user is an admin, redirect them away from the participant home page.
        router.push('/admin/default-game');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || !user.isAnonymous) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Authenticating...</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    await auth.signOut();
    resetProgress(); // Also clears local storage progress
    router.push('/login');
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary sm:text-6xl md:text-7xl">
              Subterranean Enigma
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              An AURELIA-Governed Deep System Interface
            </p>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </header>

        <AureliaMessage text="Unknown entity detected. Identity validation required. Access to subroutine sectors is... provisional. Proceed." />

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
                        {isCompleted ? <><CheckCircle className="mr-2 h-4 w-4" />Completed</> : <><Play className="mr-2 h-4 w-4" />Enter Sector</>}
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
              <Button size="lg" disabled={!isNexusUnlocked} aria-label={isNexusUnlocked ? 'Enter Nexus Convergence' : 'Nexus Locked'}>
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
          <Button variant="ghost" size="sm" onClick={resetProgress}>Reset Progress</Button>
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
    return (
        <FirebaseClientProvider>
            <HomePageContent />
        </FirebaseClientProvider>
    )
}
