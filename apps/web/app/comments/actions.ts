'use server';

// LET OP: Deze server action gebruikt direct Neon SQL i.p.v. Prisma
// Dit is een aparte feature die niet via de Express API gaat
// Runtime: Node.js (standaard voor server actions)
import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

export async function createCommentAction(prevState: { error?: string; success?: boolean } | null, formData: FormData) {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    return { error: 'Database connection not configured. Please check your environment variables.' };
  }

  const comment = formData.get('comment');

  if (!comment || typeof comment !== 'string' || comment.trim() === '') {
    return { error: 'Comment cannot be empty' };
  }

  try {
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    // Insert the comment from the form into the Postgres database
    // Using tagged template literal syntax (new Neon API)
    await sql`INSERT INTO comments (comment) VALUES (${comment.trim()})`;
    
    // Revalidate the comments page to show the new comment
    revalidatePath('/comments');
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error inserting comment:', error);
    
    // Check if it's a table doesn't exist error
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    
    if (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorCode === '42P01') {
      return { error: 'Database table does not exist. Please run the SQL migration to create the comments table.' };
    }
    
    return { error: `Failed to save comment: ${errorMessage || 'Unknown error'}` };
  }
}

