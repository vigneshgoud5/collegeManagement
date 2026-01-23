import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  dob?: Date;
  contact: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  department?: string;
  year?: number;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
    },
    contact: {
      phone: String,
      address: String,
      city: String,
      state: String,
      zip: String,
    },
    department: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: 1,
      max: 5,
    },
    avatarUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const StudentProfile: Model<IStudentProfile> = mongoose.models.StudentProfile || mongoose.model<IStudentProfile>(
  'StudentProfile',
  studentProfileSchema
);

