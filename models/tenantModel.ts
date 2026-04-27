
import mongoose, { Document, Schema, model, models } from 'mongoose';

export interface TenantDocument extends Document {
  userId: string; // Add userId field
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  yearlyPercentage?: number;
  advancePayment?: number;
  status: 'Active' | 'Pending' | 'Terminated';
  photoUrl?: string;
  documentUrl?: string;
  documentName?: string;
  aadharUrl?: string;
  aadharName?: string;
  paymentHistory: {
    id: string;
    date: string;
    amount: number;
    method: 'Bank Transfer' | 'Cash' | 'Check' | 'Online';
    status: 'Paid' | 'Pending' | 'Overdue';
    reference?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    status: { type: String, required: true },
    reference: { type: String }
  },
  { _id: false }
);

const tenantSchema = new Schema<TenantDocument>(
  {
    userId: { type: String, required: true }, // Add userId field
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    propertyAddress: { type: String, required: true },
    leaseStart: { type: String, required: true },
    leaseEnd: { type: String, required: true },
    monthlyRent: { type: Number, required: true },
    yearlyPercentage: { type: Number, default: 0 },
    advancePayment: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Pending', 'Terminated'], default: 'Active' },
    photoUrl: { type: String },
    documentUrl: { type: String },
    documentName: { type: String },
    aadharUrl: { type: String },
    aadharName: { type: String },
    paymentHistory: { type: [paymentSchema], default: [] }
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
        return result;
      }
    }
  }
);

const TenantModel = (models.Tenant as mongoose.Model<TenantDocument>) || model<TenantDocument>('Tenant', tenantSchema);
export { TenantModel };
