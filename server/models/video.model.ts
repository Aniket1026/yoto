import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

import { videoDocument as videoInterface } from '../interfaces/video.interface';

const videoSchema = new mongoose.Schema<videoInterface>(
  {
    videoFile: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    views: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model<videoInterface>('Video', videoSchema);
