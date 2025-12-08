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
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase';

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
    if (!firestore) {
      handleAuthError('Database service is not available.');
      setIsLoading(false);
      return;
    }

    try {
      const participantsRef = collection(firestore, 'participants');
      const q = query(
        participantsRef,
        where('participantCode', '==', data.code.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        handleAuthError('Invalid participant code. Please try again.');
        setIsLoading(false);
        return;
      }

      // Assuming one participant per code
      const participantDoc = querySnapshot.docs[0];
      const participantId = participantDoc.id;

      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInAnonymously(auth);

      if (userCredential.user.uid !== participantId) {
        // This is a complex scenario. For this app, we'll "merge" the anonymous user
        // with the participant record ID conceptually by re-creating the participant
        // and game state under the new anonymous UID.
        // This is a simplification for the escape room context.
        console.warn('Anonymous UID does not match participant ID. Re-linking...');
        const newParticipantRef = doc(firestore, 'participants', userCredential.user.uid);
        await setDoc(newParticipantRef, {
            id: userCredential.user.uid,
            participantCode: data.code.toUpperCase(),
        });
        const gameStateRef = doc(firestore, 'participants', userCredential.user.uid, 'gameState', 'main');
        setDocumentNonBlocking(gameStateRef, {
             id: 'main',
             participantUserId: userCredential.user.uid,
             archiveComplete: false,
             wellComplete: false,
             networkComplete: false,
             archiveKey: false,
             wellKey: false,
             networkKey: false,
        }, { merge: true });
      }

      // Redirect is handled by the useUser hook on the parent page
    } catch (error: any) {
      console.error('Participant Login Error:', error);
      handleAuthError('An unexpected error occurred during login.');
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
