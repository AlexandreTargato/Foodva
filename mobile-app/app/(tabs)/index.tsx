import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Post } from '../../types';

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const response = await api.getFeed();
      if (response.data) {
        setPosts(response.data);
      } else if (response.error) {
        Alert.alert('Error', response.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await api.unlikePost(postId);
      } else {
        await api.likePost(postId);
      }
      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, is_liked: !isLiked, likes_count: (post.likes_count || 0) + (isLiked ? -1 : 1) }
          : post
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post-detail?id=${postId}`);
  };

  const handleCommentsPress = (postId: string) => {
    router.push(`/comments?postId=${postId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foodva</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share a dish!</Text>
          </View>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onPress={handlePostPress}
              onCommentsPress={handleCommentsPress}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string, isLiked: boolean) => void;
  onPress: (postId: string) => void;
  onCommentsPress: (postId: string) => void;
}

function PostCard({ post, onLike, onPress, onCommentsPress }: PostCardProps) {
  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Image
          source={{ uri: post.users?.avatar_url || 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{post.users?.username || 'Anonymous'}</Text>
          {post.location && (
            <Text style={styles.location}>{post.location}</Text>
          )}
        </View>
      </View>

      {/* Image */}
      <TouchableOpacity onPress={() => onPress(post.id)}>
        <Image
          source={{ uri: post.image_url }}
          style={styles.postImage}
          contentFit="cover"
        />
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(post.id, post.is_liked || false)}
        >
          <Ionicons
            name={post.is_liked ? "heart" : "heart-outline"}
            size={24}
            color={post.is_liked ? "#FF3040" : "#000"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onCommentsPress(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        {(post.likes_count || 0) > 0 && (
          <Text style={styles.likesCount}>
            {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
          </Text>
        )}
      </View>

      {/* Caption */}
      {post.caption && (
        <View style={styles.caption}>
          <Text style={styles.captionText}>
            <Text style={styles.username}>{post.users?.username} </Text>
            {post.caption}
          </Text>
        </View>
      )}

      {/* View comments */}
      {(post.comments_count || 0) > 0 && (
        <TouchableOpacity onPress={() => onCommentsPress(post.id)}>
          <Text style={styles.viewComments}>
            View all {post.comments_count} comments
          </Text>
        </TouchableOpacity>
      )}

      {/* Time */}
      <Text style={styles.time}>
        {new Date(post.created_at).toLocaleDateString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  postCard: {
    marginBottom: 24,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButton: {
    marginRight: 16,
  },
  stats: {
    paddingHorizontal: 16,
  },
  likesCount: {
    fontWeight: '600',
    fontSize: 14,
  },
  caption: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 18,
  },
  viewComments: {
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  time: {
    color: '#999',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
});