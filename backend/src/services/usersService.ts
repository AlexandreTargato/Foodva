import { supabaseAdmin } from '../db/supabaseClient';
import { User, UpdateProfileRequest, Follow } from '../types';

interface UserStats {
  posts_count: number;
  followers_count: number;
  following_count: number;
}

class UsersService {
  async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return data as User;
  }

  async updateUserProfile(userId: string, profileData: UpdateProfileRequest): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data as User;
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const [postsResult, followersResult, followingResult] = await Promise.all([
      supabaseAdmin
        .from('posts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId),
      supabaseAdmin
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('following_id', userId),
      supabaseAdmin
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', userId)
    ]);

    return {
      posts_count: postsResult.count || 0,
      followers_count: followersResult.count || 0,
      following_count: followingResult.count || 0
    };
  }

  async searchUsers(query: string, limit: number = 20): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, avatar_url, full_name')
      .or(`username.ilike.%${query}%, full_name.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }

    return data as User[];
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    const { data, error } = await supabaseAdmin
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to follow user: ${error.message}`);
    }

    return data as Follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<Follow> {
    const { data, error } = await supabaseAdmin
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to unfollow user: ${error.message}`);
    }

    return data as Follow;
  }

  async checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    return !error && !!data;
  }
}

export default new UsersService();