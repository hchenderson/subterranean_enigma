'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAuthForm } from './_components/admin-auth-form';
import { ParticipantAuthForm } from './_components/participant-auth-form';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { FirebaseClientProvider } from '@/firebase/client-provider';

function LoginPageContent() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      if (user.isAnonymous) {
        router.push('/');
      } else {
        // Default admin to a specific game or dashboard
        router.push('/admin/default-game');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary">
            Subterranean Enigma
          </h1>
          <p className="text-muted-foreground">
            Identity verification required to access the AURELIA system.
          </p>
        </div>
        <Tabs defaultValue="participant" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participant">Participant</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <TabsContent value="participant">
            <ParticipantAuthForm />
          </TabsContent>
          <TabsContent value="admin">
            <AdminAuthForm />
          </TabsContent>
        </Tabs>
        <p className="px-8 text-center text-sm text-muted-foreground">
          By continuing, you agree to comply with AURELIA's operational
          protocols.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <FirebaseClientProvider>
      <LoginPageContent />
    </FirebaseClientProvider>
  );
}
