
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import {
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { useFirestore } from '@/firebase';
import {
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
} from 'firebase/firestore';

const formSchema = z.object({
  code: z.string().min(4, { message: 'Please enter a valid code.' }),
});

type ParticipantFormValues = z.infer<typeof formSchema>;

interface ParticipantAuthFormProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function ParticipantAuthForm({
  className,
  ...props
}: ParticipantAuthFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const form = useForm<ParticipantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  });

  const handleAuthError = (message: string) => {
    toast({
      variant: 'destructive',
      title: 'Login Failed',
      description: message,
    });
  };

  async function onSubmit(data: ParticipantFormValues) {
    setIsLoading(true);
    if (!firestore || !auth) {
      handleAuthError('Authentication service is not available.');
      setIsLoading(false);
      return;
    }

    try {
      // Use a collection group query to find the participant code across all games.
      const generatedCodesRef = collectionGroup(firestore, 'participants');
      const q = query(
        generatedCodesRef,
        where('participantCode', '==', data.code.toUpperCase())
      );
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        handleAuthError('Invalid participant code. Please try again.');
        setIsLoading(false);
        return;
      }

      // The code is valid. Extract the gameId from the document's path.
      const generatedCodeDoc = querySnapshot.docs[0];
      const pathSegments = generatedCodeDoc.ref.path.split('/');
      // The path is games/{gameId}/participants/{participantDocId}
      const gameId = pathSegments[1];

      if (!gameId) {
        handleAuthError('Could not determine the game for this code.');
        setIsLoading(false);
        return;
      }
      
      // 1. Sign in first and wait for it to complete.
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      // 2. Now that we are authenticated, create the user's documents.
      const batch = writeBatch(firestore);

      // Create the main participant document.
      const participantRef = doc(firestore, 'participants', user.uid);
      batch.set(participantRef, {
        id: user.uid, // Ensure the 'id' field matches the UID for security rules.
        participantCode: data.code.toUpperCase(),
        gameId: gameId,
      });

      // Create the initial game state for that participant.
      const gameStateRef = doc(firestore, 'participants', user.uid, 'gameState', 'main');
      batch.set(gameStateRef, {
        id: 'main',
        participantUserId: user.uid,
        completion: {
          archive: false,
          well: false,
          network: false,
        },
        keys: {
          archive: false,
          well: false,
          network: false,
        },
      });

      await batch.commit();

      // Redirect is handled by the useUser hook on the parent page
    } catch (error: any) {
      console.error('Participant Login Error:', error);
      if (error.code === 'permission-denied') {
          handleAuthError('Could not validate participant code. The game might be paused or does not exist.');
      } else {
        handleAuthError('An unexpected error occurred during login.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Participant Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ENTER-YOUR-CODE"
                    disabled={isLoading}
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} className="w-full" type="submit">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enter System
          </Button>
        </form>
      </Form>
    </div>
  );
}
