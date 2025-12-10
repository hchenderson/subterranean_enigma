
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, updateDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { AureliaMessage } from '@/components/game/AureliaMessage';
import { useToast } from '@/hooks/use-toast';
import { FirebaseClientProvider } from '@/firebase/client-provider';

function WelcomePageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const participantRef = useMemoFirebase(() => (user ? doc(firestore, 'participants', user.uid) : null), [user, firestore]);
  const { data: participant, isLoading: isParticipantLoading } = useDoc(participantRef);

  // Effect to handle redirection
  useEffect(() => {
    // Don’t do anything until both user and participant states are resolved
    if (isUserLoading || isParticipantLoading) return;

    // Not logged in → back to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Anonymous user but already has a display name (e.g. returning) → go home
    if (participant?.displayName) {
      router.replace('/');
    }
  }, [user, participant, isUserLoading, isParticipantLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !participantRef) return;
    setIsSubmitting(true);
    
    try {
      await updateDocumentNonBlocking(participantRef, { displayName: displayName.trim() });
      toast({
        title: 'Identity Confirmed',
        description: `Welcome to the system, ${displayName.trim()}.`,
      });
      router.push('/');
    } catch (error) {
      console.error('Failed to update display name:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save your name. Please try again.',
      });
      setIsSubmitting(false);
    }
  };
  
  const isLoading = isUserLoading || isParticipantLoading;

  if (isLoading || (participant && participant.displayName)) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Initializing Interface...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <AureliaMessage text="System entry successful. Your core signature is... anonymous. Please provide a designation for this session." />
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-8 shadow-lg">
          <div>
            <label htmlFor="displayName" className="mb-2 block text-sm font-medium text-muted-foreground">
              Enter Your Designation
            </label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., 'Operator 7'"
              className="font-code text-base"
              maxLength={50}
              required
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !displayName.trim()} className="w-full">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirm Designation
          </Button>
        </form>
      </div>
    </main>
  );
}

export default function WelcomePage() {
    return (
        <FirebaseClientProvider>
            <WelcomePageContent />
        </FirebaseClientProvider>
    )
}
