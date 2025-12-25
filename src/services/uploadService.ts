/**
 * Photo Upload Service
 *
 * Provides persistent photo storage using IndexedDB for the CMMS application.
 * This service handles photo uploads, compression, and retrieval for work order
 * documentation (before/after photos).
 *
 * In production, this would integrate with a backend file storage service.
 * For the prototype, we use IndexedDB for local persistence.
 */

import { getCurrentUserId } from '@/utils/auth';

// Types
export interface PhotoMetadata {
  workOrderId: string;
  submissionType: 'before' | 'after';
  caption?: string;
  timestamp: Date;
  userId: string;
}

export interface UploadedPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  originalFilename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  metadata: PhotoMetadata;
}

export interface PendingUpload {
  id: string;
  file: File;
  metadata: PhotoMetadata;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
  createdAt: string;
}

// IndexedDB configuration
const DB_NAME = 'cmms_photos';
const DB_VERSION = 1;
const PHOTOS_STORE = 'photos';
const THUMBNAILS_STORE = 'thumbnails';

// Maximum sizes
const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
const THUMBNAIL_MAX_WIDTH = 200;
const THUMBNAIL_MAX_HEIGHT = 200;
const PHOTO_MAX_WIDTH = 1920;
const PHOTO_MAX_HEIGHT = 1920;
const JPEG_QUALITY = 0.8;

/**
 * Initialize IndexedDB database
 */
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create photos store
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        const photosStore = db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
        photosStore.createIndex('workOrderId', 'metadata.workOrderId', { unique: false });
        photosStore.createIndex('submissionType', 'metadata.submissionType', { unique: false });
        photosStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }

      // Create thumbnails store
      if (!db.objectStoreNames.contains(THUMBNAILS_STORE)) {
        db.createObjectStore(THUMBNAILS_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Generate a unique ID for photos
 */
function generatePhotoId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Compress and resize an image
 */
async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Convert a Blob to base64 string for storage
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload a single photo
 */
export async function uploadPhoto(
  file: File,
  metadata: Omit<PhotoMetadata, 'userId' | 'timestamp'>
): Promise<UploadedPhoto> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error(`File size exceeds maximum of ${MAX_PHOTO_SIZE / 1024 / 1024}MB`);
  }

  const db = await initDB();
  const photoId = generatePhotoId();

  try {
    // Compress the main photo
    const compressedPhoto = await compressImage(
      file,
      PHOTO_MAX_WIDTH,
      PHOTO_MAX_HEIGHT,
      JPEG_QUALITY
    );

    // Create thumbnail
    const thumbnail = await compressImage(
      file,
      THUMBNAIL_MAX_WIDTH,
      THUMBNAIL_MAX_HEIGHT,
      0.7
    );

    // Convert to base64 for storage
    const photoData = await blobToBase64(compressedPhoto);
    const thumbnailData = await blobToBase64(thumbnail);

    const fullMetadata: PhotoMetadata = {
      ...metadata,
      userId: getCurrentUserId(),
      timestamp: new Date()
    };

    const uploadedPhoto: UploadedPhoto & { data: string } = {
      id: photoId,
      url: photoData, // In production, this would be a server URL
      thumbnailUrl: thumbnailData,
      originalFilename: file.name,
      size: compressedPhoto.size,
      mimeType: 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      metadata: fullMetadata,
      data: photoData
    };

    // Store in IndexedDB
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE, THUMBNAILS_STORE], 'readwrite');

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      // Store photo
      const photosStore = transaction.objectStore(PHOTOS_STORE);
      photosStore.put(uploadedPhoto);

      // Store thumbnail separately for quick access
      const thumbnailsStore = transaction.objectStore(THUMBNAILS_STORE);
      thumbnailsStore.put({
        id: photoId,
        data: thumbnailData
      });
    });

    // Return without the raw data (just URLs)
    const { data: _data, ...result } = uploadedPhoto;
    return result;
  } finally {
    db.close();
  }
}

/**
 * Upload multiple photos
 */
export async function uploadPhotos(
  files: File[],
  metadata: Omit<PhotoMetadata, 'userId' | 'timestamp'>
): Promise<UploadedPhoto[]> {
  const results: UploadedPhoto[] = [];

  for (const file of files) {
    try {
      const uploaded = await uploadPhoto(file, metadata);
      results.push(uploaded);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      // Continue with other files
    }
  }

  return results;
}

/**
 * Get photo URL by ID
 */
export async function getPhotoUrl(photoId: string): Promise<string | null> {
  const db = await initDB();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTOS_STORE, 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const request = store.get(photoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const photo = request.result;
        resolve(photo?.url || null);
      };
    });
  } finally {
    db.close();
  }
}

/**
 * Get thumbnail URL by ID
 */
export async function getThumbnailUrl(photoId: string): Promise<string | null> {
  const db = await initDB();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(THUMBNAILS_STORE, 'readonly');
      const store = transaction.objectStore(THUMBNAILS_STORE);
      const request = store.get(photoId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const thumbnail = request.result;
        resolve(thumbnail?.data || null);
      };
    });
  } finally {
    db.close();
  }
}

/**
 * Get all photos for a work order
 */
export async function getPhotosByWorkOrder(
  workOrderId: string,
  submissionType?: 'before' | 'after'
): Promise<UploadedPhoto[]> {
  const db = await initDB();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTOS_STORE, 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const index = store.index('workOrderId');
      const request = index.getAll(workOrderId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let photos = request.result as (UploadedPhoto & { data?: string })[];

        // Filter by submission type if specified
        if (submissionType) {
          photos = photos.filter(p => p.metadata.submissionType === submissionType);
        }

        // Remove raw data from results
        const results = photos.map(({ data: _data, ...photo }) => photo);
        resolve(results);
      };
    });
  } finally {
    db.close();
  }
}

/**
 * Delete a photo by ID
 */
export async function deletePhoto(photoId: string): Promise<void> {
  const db = await initDB();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE, THUMBNAILS_STORE], 'readwrite');

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();

      const photosStore = transaction.objectStore(PHOTOS_STORE);
      photosStore.delete(photoId);

      const thumbnailsStore = transaction.objectStore(THUMBNAILS_STORE);
      thumbnailsStore.delete(photoId);
    });
  } finally {
    db.close();
  }
}

/**
 * Delete all photos for a work order
 */
export async function deletePhotosByWorkOrder(workOrderId: string): Promise<void> {
  const photos = await getPhotosByWorkOrder(workOrderId);

  for (const photo of photos) {
    await deletePhoto(photo.id);
  }
}

/**
 * Clean up old photos (older than specified days)
 */
export async function cleanupOldPhotos(daysOld: number = 30): Promise<number> {
  const db = await initDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  const cutoffTimestamp = cutoffDate.toISOString();

  let deletedCount = 0;

  try {
    const photos = await new Promise<UploadedPhoto[]>((resolve, reject) => {
      const transaction = db.transaction(PHOTOS_STORE, 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const index = store.index('uploadedAt');
      const range = IDBKeyRange.upperBound(cutoffTimestamp);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

    for (const photo of photos) {
      await deletePhoto(photo.id);
      deletedCount++;
    }

    return deletedCount;
  } finally {
    db.close();
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  photoCount: number;
  totalSize: number;
  oldestPhoto: string | null;
  newestPhoto: string | null;
}> {
  const db = await initDB();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTOS_STORE, 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const photos = request.result as UploadedPhoto[];

        if (photos.length === 0) {
          resolve({
            photoCount: 0,
            totalSize: 0,
            oldestPhoto: null,
            newestPhoto: null
          });
          return;
        }

        const totalSize = photos.reduce((sum, p) => sum + p.size, 0);
        const sorted = photos.sort((a, b) =>
          new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        );

        const oldestPhoto = sorted[0];
        const newestPhoto = sorted[sorted.length - 1];

        resolve({
          photoCount: photos.length,
          totalSize,
          oldestPhoto: oldestPhoto?.uploadedAt ?? null,
          newestPhoto: newestPhoto?.uploadedAt ?? null
        });
      };
    });
  } finally {
    db.close();
  }
}

// Export the service as a singleton-like object
export const uploadService = {
  uploadPhoto,
  uploadPhotos,
  getPhotoUrl,
  getThumbnailUrl,
  getPhotosByWorkOrder,
  deletePhoto,
  deletePhotosByWorkOrder,
  cleanupOldPhotos,
  getStorageStats
};

export default uploadService;
