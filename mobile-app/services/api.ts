import { API_URL } from '../constants/Config';
import { supabase } from './supabase';
import type { Post, User, Comment, CreatePostData, ApiResponse } from '../types';

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session?.access_token && {
        'Authorization': `Bearer ${session.access_token}`,
      }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return { error: (error as Error).message };
    }
  }

  // Auth endpoints
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Posts endpoints
  async getFeed(limit = 20, offset = 0): Promise<ApiResponse<Post[]>> {
    return this.request<Post[]>(`/posts/feed?limit=${limit}&offset=${offset}`);
  }

  async createPost(postData: CreatePostData): Promise<ApiResponse<Post>> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPost(postId: string): Promise<ApiResponse<Post>> {
    return this.request<Post>(`/posts/${postId}`);
  }

  async deletePost(postId: string): Promise<ApiResponse<Post>> {
    return this.request<Post>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Users endpoints
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${userId}`);
  }

  async getUserPosts(userId: string, limit = 20, offset = 0): Promise<ApiResponse<Post[]>> {
    return this.request<Post[]>(`/users/${userId}/posts?limit=${limit}&offset=${offset}`);
  }

  async followUser(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  }

  // Likes endpoints
  async likePost(postId: string): Promise<ApiResponse<any>> {
    return this.request<any>('/likes', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId }),
    });
  }

  async unlikePost(postId: string): Promise<ApiResponse<any>> {
    return this.request<any>('/likes', {
      method: 'DELETE',
      body: JSON.stringify({ post_id: postId }),
    });
  }

  // Comments endpoints
  async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/comments/${postId}`);
  }

  async createComment(postId: string, content: string): Promise<ApiResponse<Comment>> {
    return this.request<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, content }),
    });
  }

  async deleteComment(commentId: string): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();