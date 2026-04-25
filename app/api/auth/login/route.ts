import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { signJwt } from '../../../../lib/jwt';
import { connectToDatabase } from '../../../../lib/mongodb';
import { UserModel } from '../../../../models/userModel';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!existingUser || !existingUser.password) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = signJwt({ id: existingUser._id.toString(), email: existingUser.email, role: existingUser.role });

    const user = {
      id: existingUser._id.toString(),
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      root: existingUser.root,
      avatar: existingUser.avatar,
      activated: existingUser.activated,
      photoUrl: existingUser.photoUrl || undefined,
      addresses: existingUser.addresses || [],
      theme: existingUser.theme || 'light'
    };

    return NextResponse.json({ user, token });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
