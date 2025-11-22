'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle } from 'lucide-react';
import { createCommentAction } from './actions';

export function CommentForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createCommentAction(null, formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          // Redirect on success
          window.location.href = '/comments?success=true';
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      }
    });
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Add a Comment</CardTitle>
      </CardHeader>
      <CardBody>
        {error && (
          <div className="mb-4 p-4 bg-danger-subtle border border-danger rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-danger" />
              <p className="text-danger-foreground text-sm">{error}</p>
            </div>
          </div>
        )}
        <form action={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
                Write a comment
              </label>
              <input
                type="text"
                id="comment"
                name="comment"
                placeholder="write a comment"
                required
                disabled={isPending}
                className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-60"
              />
            </div>
            <Button type="submit" variant="primary" size="md" isLoading={isPending}>
              Submit
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

