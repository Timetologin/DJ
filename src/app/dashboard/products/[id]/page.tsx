'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X, Video, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'LESSON' | 'COURSE';
  level: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags: string[];
  categoryId: string | null;
  thumbnailUrl: string | null;
  videoAsset: {
    id: string;
    fileName: string;
    storageKey: string;
  } | null;
}

const LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ALL_LEVELS', label: 'All Levels' },
];

const TYPES = [
  { value: 'LESSON', label: 'Single Lesson' },
  { value: 'COURSE', label: 'Full Course' },
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ video: boolean; thumbnail: boolean }>({
    video: false,
    thumbnail: false,
  });
  const [uploadProgress, setUploadProgress] = useState<{ video: number; thumbnail: number }>({
    video: 0,
    thumbnail: 0,
  });

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    type: 'LESSON',
    level: 'ALL_LEVELS',
    categoryId: '',
    tags: [] as string[],
    tagInput: '',
  });

  const [files, setFiles] = useState<{
    video: { key: string; name: string; isNew: boolean } | null;
    thumbnail: { key: string; url: string; isNew: boolean } | null;
  }>({
    video: null,
    thumbnail: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([fetchProduct(), fetchCategories()]);
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error('Product not found');
          router.push('/dashboard/products');
          return;
        }
        throw new Error('Failed to fetch product');
      }

      const data = await res.json();
      const p = data.product;
      
      setProduct(p);
      setForm({
        title: p.title,
        description: p.description,
        price: (p.price / 100).toFixed(2),
        type: p.type,
        level: p.level,
        categoryId: p.categoryId || '',
        tags: p.tags || [],
        tagInput: '',
      });

      if (p.videoAsset) {
        setFiles(prev => ({
          ...prev,
          video: { key: p.videoAsset.storageKey, name: p.videoAsset.fileName, isNew: false },
        }));
      }

      if (p.thumbnailUrl) {
        setFiles(prev => ({
          ...prev,
          thumbnail: { key: '', url: p.thumbnailUrl, isNew: false },
        }));
      }
    } catch (error) {
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const uploadFile = async (
    file: File,
    type: 'video' | 'thumbnail'
  ): Promise<{ key: string; url?: string } | null> => {
    try {
      setUploading(prev => ({ ...prev, [type]: true }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadType: type,
        }),
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadUrl, key, publicUrl } = await uploadRes.json();

      const xhr = new XMLHttpRequest();
      
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(prev => ({ ...prev, [type]: progress }));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      return { key, url: publicUrl };
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
      return null;
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, 'video');
    if (result) {
      setFiles(prev => ({ ...prev, video: { key: result.key, name: file.name, isNew: true } }));
      toast.success('Video uploaded successfully');
    }
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file, 'thumbnail');
    if (result) {
      setFiles(prev => ({ 
        ...prev, 
        thumbnail: { key: result.key, url: result.url || URL.createObjectURL(file), isNew: true } 
      }));
      toast.success('Thumbnail uploaded successfully');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && form.tagInput.trim()) {
      e.preventDefault();
      if (form.tags.length >= 10) {
        toast.error('Maximum 10 tags allowed');
        return;
      }
      if (!form.tags.includes(form.tagInput.trim())) {
        setForm(prev => ({
          ...prev,
          tags: [...prev.tags, prev.tagInput.trim()],
          tagInput: '',
        }));
      }
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title || form.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!form.description || form.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0.99) {
      newErrors.price = 'Price must be at least $0.99';
    }
    if (!form.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status?: 'DRAFT' | 'PUBLISHED') => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        price: Math.round(parseFloat(form.price) * 100),
        type: form.type,
        level: form.level,
        categoryId: form.categoryId,
        tags: form.tags,
      };

      if (status) {
        body.status = status;
      }

      if (files.video?.isNew) {
        body.videoKey = files.video.key;
      }

      if (files.thumbnail?.isNew) {
        body.thumbnailKey = files.thumbnail.key;
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update product');
      }

      toast.success('Product updated!');
      router.push('/dashboard/products');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-secondary rounded w-1/3" />
          <div className="h-64 bg-background-secondary rounded" />
          <div className="h-48 bg-background-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Product</h1>
            <p className="text-text-secondary mt-1">
              Update your lesson or course details
            </p>
          </div>
          <Badge variant={product.status === 'PUBLISHED' ? 'success' : 'warning'}>
            {product.status}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-background-secondary border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Basic Information</h2>
            
            <Input
              label="Title"
              placeholder="e.g., Beatmatching Fundamentals"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              error={errors.title}
            />

            <Textarea
              label="Description"
              placeholder="Describe what students will learn..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              error={errors.description}
              helperText={`${form.description.length}/50 minimum characters`}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type"
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                options={TYPES}
              />
              
              <Select
                label="Level"
                value={form.level}
                onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value }))}
                options={LEVELS}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={form.categoryId}
                onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Select a category"
                error={errors.categoryId}
              />
              
              <Input
                label="Price (USD)"
                type="number"
                min="0.99"
                step="0.01"
                placeholder="19.99"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
                error={errors.price}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Tags
              </label>
              <Input
                placeholder="Type and press Enter to add tags"
                value={form.tagInput}
                onChange={(e) => setForm(prev => ({ ...prev, tagInput: e.target.value }))}
                onKeyDown={handleAddTag}
                helperText="Press Enter to add a tag (max 10)"
              />
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="pr-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 p-0.5 hover:bg-white/10 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-background-secondary border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Video Content</h2>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Main Video
              </label>
              {files.video ? (
                <div className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
                  <Video className="w-8 h-8 text-accent" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{files.video.name}</p>
                    <p className="text-sm text-text-secondary">
                      {files.video.isNew ? 'New video uploaded' : 'Current video'}
                    </p>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                      className="hidden"
                      disabled={uploading.video}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>Replace</span>
                    </Button>
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                    disabled={uploading.video}
                  />
                  {uploading.video ? (
                    <>
                      <Loader2 className="w-10 h-10 text-accent animate-spin mb-2" />
                      <p className="text-white font-medium">Uploading... {uploadProgress.video}%</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-text-tertiary mb-2" />
                      <p className="text-white font-medium">Click to upload video</p>
                      <p className="text-sm text-text-secondary mt-1">MP4, MOV, WebM (max 5GB)</p>
                    </>
                  )}
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Thumbnail Image
              </label>
              {files.thumbnail ? (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden group">
                  <Image
                    src={files.thumbnail.url}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        className="hidden"
                        disabled={uploading.thumbnail}
                      />
                      <Button variant="outline" size="sm" asChild>
                        <span>Replace</span>
                      </Button>
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 transition-colors w-48">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailSelect}
                    className="hidden"
                    disabled={uploading.thumbnail}
                  />
                  {uploading.thumbnail ? (
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-text-tertiary mb-1" />
                      <p className="text-sm text-text-secondary">Upload thumbnail</p>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div>
              {product.status === 'PUBLISHED' ? (
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('DRAFT')}
                  loading={saving}
                  disabled={uploading.video || uploading.thumbnail}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleSubmit('PUBLISHED')}
                  loading={saving}
                  disabled={uploading.video || uploading.thumbnail}
                >
                  Publish
                </Button>
              )}
            </div>
            <Button
              onClick={() => handleSubmit()}
              loading={saving}
              disabled={uploading.video || uploading.thumbnail}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
