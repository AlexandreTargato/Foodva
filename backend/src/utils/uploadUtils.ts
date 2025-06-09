import { supabase } from '../db/supabaseClient';
import config from '../config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
  url: string;
  path: string;
}

export class UploadUtils {
  static async uploadImage(
    file: Buffer | Uint8Array | File,
    folder: string = 'posts',
    fileName?: string
  ): Promise<UploadResult> {
    try {
      const fileExtension = 'jpg'; // Default extension, should be determined from file
      const uniqueFileName = fileName || `${uuidv4()}.${fileExtension}`;
      const filePath = `${folder}/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from(config.supabase.storageBucket)
        .upload(filePath, file, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(config.supabase.storageBucket)
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      throw new Error(`Image upload failed: ${(error as Error).message}`);
    }
  }

  static async deleteImage(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(config.supabase.storageBucket)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Image deletion failed: ${(error as Error).message}`);
    }
  }

  static getImageUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(config.supabase.storageBucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  static validateImageFile(file: any): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    return true;
  }
}

export default UploadUtils;