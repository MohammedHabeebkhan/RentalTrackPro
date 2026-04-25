import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { signJwt } from '../../../../lib/jwt';
import { connectToDatabase } from '../../../../lib/mongodb';
import { UserModel } from '../../../../models/userModel';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await UserModel.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      root: false,
      avatar: 'avatar.png',
      activated: true,
      addresses: [],
      theme: 'light'
    });

    const token = signJwt({ id: createdUser._id.toString(), email: createdUser.email, role: createdUser.role });

    const user = {
      id: createdUser._id.toString(),
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      root: createdUser.root,
      avatar: createdUser.avatar,
      activated: createdUser.activated,
      photoUrl: createdUser.photoUrl || undefined,
      addresses: createdUser.addresses || [],
      theme: createdUser.theme || 'light'
    };

    return NextResponse.json({ user, token });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
