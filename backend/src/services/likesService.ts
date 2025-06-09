import { supabaseAdmin } from '../db/supabaseClient';
import { Like } from '../types';

class LikesService {
  async likePost(userId: string, postId: string): Promise<Like> {
    const { data, error } = await supabaseAdmin
      .from('likes')
      .insert({
        user_id: userId,
        post_id: postId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Post already liked');
      }
      throw new Error(`Failed to like post: ${error.message}`);
    }

    return data as Like;
  }

  async unlikePost(userId: string, postId: string): Promise<Like> {
    const { data, error } = await supabaseAdmin
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to unlike post: ${error.message}`);
    }

    return data as Like;
  }

  async getLikeStatus(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    return !error && !!data;
  }

  async getPostLikes(postId: string, limit: number = 50, offset: number = 0): Promise<Like[]> {
    const { data, error } = await supabaseAdmin
      .from('likes')
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get post likes: ${error.message}`);
    }

    return data as Like[];
  }

  async getUserLikes(userId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('likes')
      .select(`
        *,
        posts:post_id (
          id,
          image_url,
          caption,
          created_at,
          users:user_id (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get user likes: ${error.message}`);
    }

    return data;
  }
}

export default new LikesService();