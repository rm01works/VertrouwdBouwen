import { neon } from '@neondatabase/serverless';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';
import { CommentForm } from './CommentForm';

async function getComments() {
  'use server';

  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return [];
    }
    
    const sql = neon(`${process.env.DATABASE_URL}`);
    // Using tagged template literal syntax (new Neon API)
    const comments = await sql`SELECT * FROM comments ORDER BY id DESC LIMIT 50`;
    return comments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    // Return empty array on error (e.g., table doesn't exist yet)
    return [];
  }
}

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const comments = await getComments();
  const showSuccess = searchParams.success === 'true';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Comments</h1>

        {showSuccess && (
          <Card className="mb-6 border-success/30 bg-success-subtle/50">
            <CardBody className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <p className="text-success-foreground font-medium">Comment saved successfully!</p>
              </div>
            </CardBody>
          </Card>
        )}

        <CommentForm />

        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardBody>
            {comments.length === 0 ? (
              <p className="text-foreground-muted">No comments yet. Be the first to comment!</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((comment: Record<string, unknown>, index: number) => {
                  const commentText = typeof comment.comment === 'string' ? comment.comment : '';
                  const commentId = typeof comment.id === 'number' ? comment.id : undefined;
                  const createdAt = comment.created_at;
                  
                  return (
                    <li
                      key={commentId || index}
                      className="p-4 bg-surface border border-border rounded-lg"
                    >
                      <p className="text-foreground">{commentText}</p>
                      {createdAt && (typeof createdAt === 'string' || createdAt instanceof Date) ? (
                        <p className="text-sm text-foreground-muted mt-2">
                          {new Date(createdAt as string | Date).toLocaleString()}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

