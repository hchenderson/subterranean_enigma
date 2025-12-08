"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface PuzzlePlaceholderProps {
  puzzleNumber: number;
  title: string;
  description: string;
  onSolve: () => void;
  children?: React.ReactNode;
}

export function PuzzlePlaceholder({ puzzleNumber, title, description, onSolve, children }: PuzzlePlaceholderProps) {
    const { toast } = useToast();

    const handleAttempt = () => {
        // In a real scenario, you'd check the solution here.
        // For now, we'll just show a success toast and solve it.
        toast({
            title: "Solution Accepted",
            description: `Access to puzzle ${puzzleNumber + 1} granted.`,
        });
        onSolve();
    }

  return (
    <Card className="bg-card/50 border-primary/20 w-full max-w-3xl mx-auto animate-fade-in shadow-lg shadow-black/20">
      <CardHeader>
        <CardTitle className="font-headline text-xl sm:text-2xl text-primary/90">
            {puzzleNumber > 0 ? `Stage ${puzzleNumber}: ${title}`: title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {children || <p className="font-code text-muted-foreground p-4 bg-black/20 rounded-md">Interactive puzzle area placeholder.</p>}
        <Input placeholder="Enter solution sequence..." className="mt-4 font-code text-base" />
      </CardContent>
      <CardFooter>
        <Button onClick={handleAttempt} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Submit Sequence
        </Button>
      </CardFooter>
    </Card>
  );
}
