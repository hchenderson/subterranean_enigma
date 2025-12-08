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
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { useAuth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  getAdditionalUserInfo,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

type UserFormValues = z.infer<typeof formSchema>;

interface AdminAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminAuthForm({ className, ...props }: AdminAuthFormProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false);
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin');

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleAuthError = (error: any) => {
    let description = 'An unexpected error occurred. Please try again.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = 'Invalid credentials. Please check your email and password.';
    } else if (error.code === 'auth/invalid-email') {
        description = 'The email address is not valid.';
    } else if (error.code === 'auth/email-already-in-use') {
        description = 'An account with this email address already exists.';
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description,
    });
  };

  async function onSubmit(data: UserFormValues) {
    setIsLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        await upsertAdminUser(userCredential.user);
      } else {
        await signInWithEmailAndPassword(auth, data.email, data.password);
      }
      // Let the useUser hook handle redirect
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      if (additionalInfo?.isNewUser) {
        await upsertAdminUser(user);
      }
      // Let the useUser hook handle redirect
    } catch (error: any) {
       handleAuthError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function upsertAdminUser(user: User) {
    if (!firestore) return;
    const userRef = doc(firestore, 'admins', user.uid);
    setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        googleId: user.providerData.find(p => p.providerId === 'google.com')?.uid,
    }, { merge: true });
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    disabled={isLoading || isGoogleLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading || isGoogleLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isLoading || isGoogleLoading}
            className="w-full"
            type="submit"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {authMode === 'signin' ? 'Sign In with Email' : 'Sign Up with Email'}
          </Button>
        </form>
      </Form>

       <p className="text-sm text-center text-muted-foreground">
        {authMode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
        <Button
          variant="link"
          className="px-1"
          onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
        >
          {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
        </Button>
      </p>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading || isGoogleLoading}
        onClick={onGoogleSignIn}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-4 w-4" />
        )}{' '}
        Google
      </Button>
    </div>
  );
}
