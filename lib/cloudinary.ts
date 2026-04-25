
import { CONFIG } from '../config';

/**
 * Server-side Cloudinary configuration.
 * Note: In a browser environment, we use the Upload API via fetch.
 * This file serves as the architecture reference for your Next.js backend.
 */
export const cloudinaryConfig = {
  cloud_name: CONFIG.CLOUDINARY_CLOUD_NAME,
  api_key: CONFIG.CLOUDINARY_API_KEY,
  api_secret: CONFIG.CLOUDINARY_API_SECRET,
};

export const getCloudinaryUrl = (publicId: string) => {
  return `https://res.cloudinary.com/${CONFIG.CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
};
