import { supabaseAdmin } from '../db/supabaseClient';
import { Post, CreatePostRequest } from '../types';

class PostsService {
  async createPost(userId: string, postData: CreatePostRequest): Promise<Post> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({
        user_id: userId,
        ...postData,
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
      throw new Error(`Failed to create post: ${error.message}`);
    }

    return data as Post;
  }

  async getFeed(limit: number = 20, offset: number = 0, userId?: string): Promise<Post[]> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        ),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get feed: ${error.message}`);
    }

    if (userId) {
      const postsWithLikeStatus = await this.addLikeStatus(data as Post[], userId);
      return postsWithLikeStatus;
    }

    return data as Post[];
  }

  async getPostById(postId: string, userId?: string): Promise<Post> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        ),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      throw new Error(`Failed to get post: ${error.message}`);
    }

    if (userId) {
      const [postWithLikeStatus] = await this.addLikeStatus([data as Post], userId);
      return postWithLikeStatus;
    }

    return data as Post;
  }

  async getUserPosts(userId: string, limit: number = 20, offset: number = 0): Promise<Post[]> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        users:user_id (
          id,
          username,
          avatar_url
        ),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get user posts: ${error.message}`);
    }

    return data as Post[];
  }

  async deletePost(postId: string, userId: string): Promise<Post> {
    const { data, error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }

    return data as Post;
  }

  async addLikeStatus(posts: Post[], userId: string): Promise<Post[]> {
    if (!posts.length) return posts;

    const postIds = posts.map(post => post.id);
    
    const { data: likes, error } = await supabaseAdmin
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);

    if (error) {
      console.error('Failed to get like status:', error);
      return posts;
    }

    const likedPostIds = new Set(likes?.map(like => like.post_id) || []);

    return posts.map(post => ({
      ...post,
      is_liked: likedPostIds.has(post.id)
    }));
  }
}

export default new PostsService();