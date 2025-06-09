export interface User {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  location?: string;
  created_at: string;
  updated_at?: string;
  users?: User;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  users?: User;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  users?: User;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface CreatePostRequest {
  image_url: string;
  caption?: string;
  location?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface UpdateProfileRequest {
  username?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}