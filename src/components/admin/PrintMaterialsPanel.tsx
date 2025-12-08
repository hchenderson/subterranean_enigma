'use client';

import React, { useState, useCallback } from 'react';
import {
  collection,
  doc,
  orderBy,
  query,
} from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { useFirestore, useStorage, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Material = {
  id: string;
  title: string;
  description?: string;
  storagePath: string;
  phase?: string;
  printed?: boolean;
  required?: boolean;
};

interface PrintMaterialsPanelProps {
  gameId: string;
}

export const PrintMaterialsPanel: React.FC<PrintMaterialsPanelProps> = ({
  gameId,
}) => {
  const firestore = useFirestore();
  const storage = useStorage();
  const { user } = useUser();
  const { toast } = useToast();

  const [printingId, setPrintingId] = useState<string | null>(null);

  const materialsRef = useMemoFirebase(
    () => (gameId ? query(collection(firestore, 'games', gameId, 'materials'), orderBy('title')) : null),
    [firestore, gameId]
  );
  
  const { data: materials, isLoading, error } = useCollection<Omit<Material, 'id'>>(materialsRef);

  const isAdmin = user && !user.isAnonymous;

  const handlePrint = useCallback(
    async (material: Material) => {
      if (!storage) {
        toast({
          variant: 'destructive',
          title: 'Storage Error',
          description: 'Firebase Storage is not available.'
        });
        return;
      }
      try {
        setPrintingId(material.id);

        const fileRef = ref(storage, material.storagePath);
        const url = await getDownloadURL(fileRef);

        window.open(url, '_blank', 'noopener,noreferrer');

        if (isAdmin && firestore) {
          const matDocRef = doc(
            firestore,
            'games',
            gameId,
            'materials',
            material.id
          );
          updateDocumentNonBlocking(matDocRef, {
            printed: true,
          });
        }
      } catch (err) {
        console.error('Error printing material:', err);
        toast({
            variant: 'destructive',
            title: 'Printing Error',
            description: 'Could not get the download URL for the material. Check storage permissions and file path.'
        });
      } finally {
        setPrintingId(null);
      }
    },
    [gameId, isAdmin, firestore, storage, toast]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Print Materials</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <p className="text-muted-foreground">Loading materials...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
         <CardHeader>
            <CardTitle className="text-destructive">Loading Error</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-destructive">
             Could not load materials: {error.message}
            </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Print Materials</CardTitle>
        <CardDescription>
          Open each PDF in a new tab and print as needed.{' '}
          {isAdmin
            ? 'Printed items will be tracked here for your convenience.'
            : 'Your host can tell you which ones to print.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {(materials ?? []).length === 0 ? (
             <p className="text-center text-sm text-muted-foreground pt-4">No printable materials have been configured for this game yet.</p>
        ) : (
            materials!.map((material) => (
            <div
                key={material.id}
                className="flex items-start justify-between rounded-md border bg-background p-3"
            >
                <div className="pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium">{material.title}</h3>
                    {material.required && (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">Required</Badge>
                    )}
                    {material.printed && (
                    <Badge variant="secondary">Printed</Badge>
                    )}
                </div>
                {material.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                    {material.description}
                    </p>
                )}
                {material.phase && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground/80">
                    Phase: {material.phase}
                    </p>
                )}
                </div>

                <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrint(material)}
                disabled={printingId === material.id}
                >
                {printingId === material.id ? <Loader2 className="animate-spin" /> : 'Open & Print'}
                </Button>
            </div>
            ))
        )}
      </CardContent>
    </Card>
  );
};
