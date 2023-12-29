import mongoose, { Document } from 'mongoose';

export interface videoDocument extends Document {
    videoFile: string;
    thumbnail: string;
    title: string;
    views: number;
    description: string;
    duration: number;
    isPublished: boolean
    owner:mongoose.Schema.Types.ObjectId
}
