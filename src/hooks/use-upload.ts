'use client';

import { useState, useCallback } from 'react';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: Error) => void;
}

interface UploadResult {
  key: string;
  publicUrl: string;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const upload = useCallback(async (
    file: File,
    uploadType: 'video' | 'thumbnail' | 'preview',
    options?: UploadOptions
  ): Promise<UploadResult | null> => {
    setState({ isUploading: true, progress: 0, error: null });

    try {
      // Get signed upload URL from our API
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadType,
        }),
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { uploadUrl, key, publicUrl } = await uploadRes.json();

      // Upload file directly to S3 using XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setState(prev => ({ ...prev, progress }));
            options?.onProgress?.(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      const result: UploadResult = { key, publicUrl };
      
      setState({ isUploading: false, progress: 100, error: null });
      options?.onSuccess?.(result);
      
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      setState({ isUploading: false, progress: 0, error: err });
      options?.onError?.(err);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return {
    upload,
    reset,
    isUploading: state.isUploading,
    progress: state.progress,
    error: state.error,
  };
}
