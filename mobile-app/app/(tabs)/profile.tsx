import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Post, User } from '../../types';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 3; // 3 columns with padding

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userStats, setUserStats] = useState({
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [postsResponse, profileResponse] = await Promise.all([
        api.getUserPosts(user.id),
        api.getUserProfile(user.id),
      ]);

      if (postsResponse.data) {
        setUserPosts(postsResponse.data);
      }

      if (profileResponse.data) {
        setUserStats({
          posts_count: profileResponse.data.posts_count || 0,
          followers_count: profileResponse.data.followers_count || 0,
          following_count: profileResponse.data.following_count || 0,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post-detail?id=${postId}`);
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>No user data</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.username}>{user.username}</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Ionicons name="menu" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <View style={styles.profileHeader}>
          <Image
            source={{ 
              uri: user.avatar_url || 'https://via.placeholder.com/80' 
            }}
            style={styles.profileImage}
          />
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userStats.posts_count}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userStats.followers_count}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userStats.following_count}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Profile Details */}
        <View style={styles.profileDetails}>
          {user.full_name && (
            <Text style={styles.fullName}>{user.full_name}</Text>
          )}
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Posts Grid */}
      <View style={styles.postsSection}>
        <View style={styles.postsHeader}>
          <Ionicons name="grid" size={24} color="#000" />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading posts...</Text>
          </View>
        ) : userPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="camera" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No Posts Yet</Text>
            <Text style={styles.emptySubtext}>Start sharing your culinary creations!</Text>
            <TouchableOpacity
              style={styles.firstPostButton}
              onPress={() => router.push('/(tabs)/upload')}
            >
              <Text style={styles.firstPostButtonText}>Share Your First Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.postsGrid}>
            {userPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postItem}
                onPress={() => handlePostPress(post.id)}
              >
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    paddingHorizontal: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 24,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  profileDetails: {
    marginBottom: 16,
  },
  fullName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  postsSection: {
    flex: 1,
  },
  postsHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
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
    textAlign: 'center',
  },
  firstPostButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  firstPostButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  postItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: 8,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});