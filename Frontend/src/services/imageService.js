import { apiRequest } from './api';

/**
 * Upload an image to the server
 * @param {File} file The image file to upload
 * @param {string} folder Optional folder name on the server
 * @returns {Promise<{success: boolean, path: string, url: string, message: string}>}
 */
export async function uploadImage(file, folder = 'uploads') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  return await apiRequest('/upload/image', {
    method: 'POST',
    body: formData,
    // Note: apiRequest already handles omitting Content-Type for FormData
  });
}

export const imageService = {
  uploadImage,
};
