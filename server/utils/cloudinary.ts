import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

const cloudinaryConfig: Readonly<CloudinaryConfig> = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
};

cloudinary.config(cloudinaryConfig);

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto'
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log('Removed file from server ', error);
    return null;
  }
};
