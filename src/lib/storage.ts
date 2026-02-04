import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const getS3Client = () => {
  const config: {
    region: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
    endpoint?: string;
    forcePathStyle?: boolean;
  } = {
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  };

  // For Cloudflare R2 or other S3-compatible storage
  if (process.env.S3_ENDPOINT) {
    config.endpoint = process.env.S3_ENDPOINT;
    config.forcePathStyle = true;
  }

  return new S3Client(config);
};

const s3Client = getS3Client();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || '';

export type UploadType = 'video' | 'thumbnail' | 'preview';

const getKeyPrefix = (type: UploadType): string => {
  switch (type) {
    case 'video':
      return 'videos';
    case 'thumbnail':
      return 'thumbnails';
    case 'preview':
      return 'previews';
    default:
      return 'uploads';
  }
};

const getAllowedMimeTypes = (type: UploadType): string[] => {
  switch (type) {
    case 'video':
    case 'preview':
      return ['video/mp4', 'video/webm', 'video/quicktime'];
    case 'thumbnail':
      return ['image/jpeg', 'image/png', 'image/webp'];
    default:
      return [];
  }
};

const getMaxFileSize = (type: UploadType): number => {
  switch (type) {
    case 'video':
      return 5 * 1024 * 1024 * 1024; // 5GB
    case 'preview':
      return 500 * 1024 * 1024; // 500MB
    case 'thumbnail':
      return 10 * 1024 * 1024; // 10MB
    default:
      return 10 * 1024 * 1024;
  }
};

export interface SignedUploadUrlParams {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadType: UploadType;
  userId: string;
}

export interface SignedUploadUrlResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export async function getSignedUploadUrl(
  params: SignedUploadUrlParams
): Promise<SignedUploadUrlResult> {
  const { fileName, fileType, fileSize, uploadType, userId } = params;

  // Validate file type
  const allowedTypes = getAllowedMimeTypes(uploadType);
  if (!allowedTypes.includes(fileType)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  // Validate file size
  const maxSize = getMaxFileSize(uploadType);
  if (fileSize > maxSize) {
    throw new Error(
      `File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`
    );
  }

  // Generate unique key
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `${getKeyPrefix(uploadType)}/${userId}/${timestamp}-${sanitizedFileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1 hour
  });

  const publicUrl = process.env.STORAGE_PUBLIC_URL
    ? `${process.env.STORAGE_PUBLIC_URL}/${key}`
    : `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;

  return {
    uploadUrl,
    key,
    publicUrl,
  };
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export function getPublicUrl(key: string): string {
  if (process.env.STORAGE_PUBLIC_URL) {
    return `${process.env.STORAGE_PUBLIC_URL}/${key}`;
  }
  return `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
}
