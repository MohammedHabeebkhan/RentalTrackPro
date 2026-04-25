
import mongoose, { Document, Schema, model, models } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  root: boolean;
  avatar: string;
  activated: boolean;
  addresses: any[];
  photoUrl?: string;
  theme?: 'light' | 'dark';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    root: { type: Boolean, default: false },
    avatar: { type: String, default: 'avatar.png' },
    activated: { type: Boolean, default: true },
    addresses: { type: Array as any, default: [] },
    photoUrl: { type: String },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const result = ret as any;
        result.id = result._id;
        delete result._id;
        delete result.password;
        return result;
      }
    }
  }
);

const UserModel = (models.User as mongoose.Model<UserDocument>) || model<UserDocument>('User', userSchema);
export { UserModel };
