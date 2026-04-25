import { NextResponse } from 'next/server';
import { getBearerToken, signJwt, verifyJwt } from '../../../../lib/jwt';
import { connectToDatabase } from '../../../../lib/mongodb';
import { UserModel } from '../../../../models/userModel';

export async function PUT(request: Request) {
  try {
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
    const { name, email, photoUrl, theme } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if email is taken by another user
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
      _id: { $ne: decodedToken.id }
    }).lean();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already taken by another user.' }, { status: 409 });
    }

    // Update user profile
    const updatedUser = await UserModel.findByIdAndUpdate(
      decodedToken.id,
      {
        name,
        email: email.toLowerCase(),
        photoUrl: photoUrl || null,
        theme: theme || 'light'
      },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Generate new token with updated data
    const newToken = signJwt({
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      role: updatedUser.role
    });

    const user = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      root: updatedUser.root,
      avatar: updatedUser.avatar,
      activated: updatedUser.activated,
      photoUrl: updatedUser.photoUrl || undefined,
      addresses: updatedUser.addresses || [],
      theme: updatedUser.theme || 'light'
    };

    return NextResponse.json({ user, token: newToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
