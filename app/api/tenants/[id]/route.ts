import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '../../../../lib/jwt';
import { connectToDatabase } from '../../../../lib/mongodb';
import { TenantModel } from '../../../../models/tenantModel';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = verifyJwt(token);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json();
  await connectToDatabase();

  if (body.yearlyPercentage !== undefined) {
    const yearlyPercentage = Number(body.yearlyPercentage);
    body.yearlyPercentage = Number.isFinite(yearlyPercentage) ? yearlyPercentage : 0;
  }

  // Ensure user can only update their own tenants or tenants without userId (legacy)
  const updatedTenant = await TenantModel.findOneAndUpdate(
    {
      _id: id,
      $or: [
        { userId: decodedToken.id },
        { userId: { $exists: false } }
      ]
    },
    body,
    { new: true }
  ).lean();

  if (!updatedTenant) {
    return NextResponse.json({ error: 'Tenant not found or access denied.' }, { status: 404 });
  }

  return NextResponse.json({
    ...updatedTenant,
    id: updatedTenant._id?.toString(),
    createdAt: updatedTenant.createdAt?.toISOString?.()
  });
}
