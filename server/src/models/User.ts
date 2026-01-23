import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'academic' | 'student';
  subRole?: 'faculty' | 'administrative'; // Sub-role for academic users
  name?: string; // Name for academic users
  avatarUrl?: string; // Profile photo URL (for academic users)
  department?: string; // Department (for academic users)
  contact?: {
    phone?: string;
    address?: string;
  }; // Contact information (for academic users)
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['academic', 'student'],
      required: true,
    },
    subRole: {
      type: String,
      enum: ['faculty', 'administrative'],
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    avatarUrl: {
      type: String,
      required: false,
    },
    department: {
      type: String,
      required: false,
    },
    contact: {
      phone: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

