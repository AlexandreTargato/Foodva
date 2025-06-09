import { supabaseAdmin } from '../db/supabaseClient';
import { Comment, CreateCommentRequest } from '../types';

class CommentsService {
  async createComment(userId: string, postId: string, content: string): Promise<Comment> {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .insert({
        user_id: userId,
        post_id: postId,
        content,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    return data as Comment;
  }

  async getCommentsByPost(postId: string, limit: number = 50, offset: number = 0): Promise<Comment[]> {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get comments: ${error.message}`);
    }

    return data as Comment[];
  }

  async deleteComment(commentId: string, userId: string): Promise<Comment> {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }

    return data as Comment;
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<Comment> {
    const { data, error } = await supabaseAdmin
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)
      .eq('user_id', userId)
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update comment: ${error.message}`);
    }

    return data as Comment;
  }
}

export default new CommentsService();