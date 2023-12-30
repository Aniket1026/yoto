import { v2 as cloudinary,UploadApiResponse } from 'cloudinary';
import fs from 'fs';

interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    });
    console.log('File has been uploaded', response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log('Removed file from server ', error);
  }
};

const cloudinaryConfig: CloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
};

cloudinary.config(cloudinaryConfig);
