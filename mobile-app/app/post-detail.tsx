import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Post } from '../types';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const loadPost = async () => {
    try {
      const response = await api.getPost(id!);
      if (response.data) {
        setPost(response.data);
      } else if (response.error) {
        Alert.alert('Error', response.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      if (post.is_liked) {
        await api.unlikePost(post.id);
      } else {
        await api.likePost(post.id);
      }
      
      setPost({
        ...post,
        is_liked: !post.is_liked,
        likes_count: (post.likes_count || 0) + (post.is_liked ? -1 : 1),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleCommentsPress = () => {
    router.push(`/comments?postId=${post?.id}`);
  };

  const handleDeletePost = () => {
    if (!post || post.user_id !== user?.id) return;

    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deletePost(post.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: post.users?.avatar_url || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.username}>{post.users?.username || 'Anonymous'}</Text>
            {post.location && (
              <Text style={styles.location}>{post.location}</Text>
            )}
          </View>
        </View>

        {/* Show delete option for own posts */}
        {post.user_id === user?.id && (
          <TouchableOpacity onPress={handleDeletePost}>
            <Ionicons name="trash-outline" size={24} color="#FF3040" />
          </TouchableOpacity>
        )}
      </View>

      {/* Image */}
      <Image
        source={{ uri: post.image_url }}
        style={styles.postImage}
        contentFit="cover"
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={post.is_liked ? "heart" : "heart-outline"}
            size={28}
            color={post.is_liked ? "#FF3040" : "#000"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleCommentsPress}>
          <Ionicons name="chatbubble-outline" size={28} color="#000" />
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

      {/* Comments Preview */}
      {(post.comments_count || 0) > 0 && (
        <TouchableOpacity 
          style={styles.commentsPreview}
          onPress={handleCommentsPress}
        >
          <Text style={styles.viewComments}>
            View all {post.comments_count} comments
          </Text>
        </TouchableOpacity>
      )}

      {/* Time */}
      <View style={styles.timeSection}>
        <Text style={styles.time}>
          {new Date(post.created_at).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
  },
  location: {
    fontSize: 14,
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
    paddingVertical: 16,
  },
  actionButton: {
    marginRight: 20,
  },
  stats: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  likesCount: {
    fontWeight: '600',
    fontSize: 16,
  },
  caption: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  captionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  commentsPreview: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  viewComments: {
    color: '#666',
    fontSize: 16,
  },
  timeSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 12,
  },
  time: {
    color: '#999',
    fontSize: 14,
  },
});