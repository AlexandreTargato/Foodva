import { supabaseAdmin } from '../db/supabaseClient';
import { User, UpdateProfileRequest } from '../types';

class AuthService {
  async getCurrentUser(userId: string): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get user: ${error.message}`);
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
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data as User;
  }

  async createUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({ id: userId, ...profileData })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return data as User;
  }
}

export default new AuthService();