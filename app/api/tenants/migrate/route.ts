import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongodb';
import { TenantModel } from '../../../models/tenantModel';
import { UserModel } from '../../../models/userModel';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // Find the first user (khanbhai@gmail.com)
    const firstUser = await UserModel.findOne({ email: 'khanbhai@gmail.com' }).lean();
    if (!firstUser) {
      return NextResponse.json({ error: 'First user not found. Please ensure khanbhai@gmail.com exists.' }, { status: 404 });
    }

    // Find all tenants without userId
    const tenantsWithoutUserId = await TenantModel.find({ userId: { $exists: false } }).lean();

    if (tenantsWithoutUserId.length === 0) {
      return NextResponse.json({ message: 'No tenants need migration.' });
    }

    // Update all tenants without userId to belong to the first user
    const result = await TenantModel.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: firstUser._id.toString() } }
    );

    return NextResponse.json({
      message: `Migration completed. ${result.modifiedCount} tenants assigned to ${firstUser.email}`,
      migratedCount: result.modifiedCount
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Migration failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}