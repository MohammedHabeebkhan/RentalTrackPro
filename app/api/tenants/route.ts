import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '../../../lib/jwt';
import { connectToDatabase } from '../../../lib/mongodb';
import { TenantModel } from '../../../models/tenantModel';

export async function GET(request: Request) {
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

  await connectToDatabase();
  // For backward compatibility, include tenants without userId (they belong to the first user)
  // TODO: Run migration to assign userId to existing tenants
  const tenants = await TenantModel.find({
    $or: [
      { userId: decodedToken.id },
      { userId: { $exists: false } }
    ]
  }).sort({ createdAt: -1 }).lean();

  const responseTenants = tenants.map((item: any) => ({
    ...item,
    id: item._id?.toString() || item.id,
    createdAt: item.createdAt?.toISOString?.() || item.createdAt
  }));

  return NextResponse.json(responseTenants);
}

export async function POST(request: Request) {
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

  const body = await request.json();
  await connectToDatabase();

  const yearlyPercentage = Number(body.yearlyPercentage);

  const newTenant = await TenantModel.create({
    ...body,
    yearlyPercentage: Number.isFinite(yearlyPercentage) ? yearlyPercentage : 0,
    userId: decodedToken.id, // Add userId from authenticated user
    createdAt: new Date(),
    paymentHistory: body.paymentHistory || []
  });

  return NextResponse.json({
    ...newTenant.toObject(),
    id: newTenant._id.toString(),
    createdAt: newTenant.createdAt?.toISOString?.()
  });
}
