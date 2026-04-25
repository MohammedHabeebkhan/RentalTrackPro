
import { CONFIG } from '../config';

/**
 * CLOUDINARY UPLOAD ENGINE
 * Target: testecommerce
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CONFIG.CLOUDINARY_UPLOAD_PRESET);
  // Fix: Access CLOUDINARY_API_KEY directly from CONFIG as it is a top-level property
  formData.append('api_key', CONFIG.CLOUDINARY_API_KEY);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Engine Error:', error);
    // Development fallback
    return URL.createObjectURL(file);
  }
};
