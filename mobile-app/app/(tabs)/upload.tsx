import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { api } from '../../services/api';
import { supabase } from '../../services/supabase';

export default function UploadScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      // Get file info
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create file name
      const fileName = `${Date.now()}.jpg`;
      const filePath = `posts/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('foodva-images')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('foodva-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  };

  const handlePost = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Error', 'Please add a caption');
      return;
    }

    setUploading(true);

    try {
      // Upload image
      const imageUrl = await uploadImage(image);

      // Create post
      const response = await api.createPost({
        image_url: imageUrl,
        caption: caption.trim(),
        location: location.trim() || undefined,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Reset form
      setImage(null);
      setCaption('');
      setLocation('');

      Alert.alert('Success!', 'Your post has been shared!', [
        { text: 'OK', onPress: () => router.push('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Share a Dish</Text>
      </View>

      {/* Image Selection */}
      <View style={styles.imageSection}>
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
            >
              <Text style={styles.changeImageText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={48} color="#ccc" />
            <Text style={styles.placeholderText}>Add a photo of your dish</Text>
            
            <View style={styles.imageButtons}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#007AFF" />
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="images" size={24} color="#007AFF" />
                <Text style={styles.imageButtonText}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Caption Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Caption *</Text>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={2000}
        />
        <Text style={styles.characterCount}>{caption.length}/2000</Text>
      </View>

      {/* Location Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Add location (optional)"
          value={location}
          onChangeText={setLocation}
          maxLength={100}
        />
      </View>

      {/* Post Button */}
      <TouchableOpacity
        style={[styles.postButton, (!image || !caption.trim() || uploading) && styles.postButtonDisabled]}
        onPress={handlePost}
        disabled={!image || !caption.trim() || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.postButtonText}>Share Post</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  imageSection: {
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  changeImageButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  changeImageText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  imageButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minWidth: 120,
  },
  imageButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  inputSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  captionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  postButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});