import { NextApiRequest, NextApiResponse } from 'next';
import {connectDB} from '../../../lib/db';
import User from '@/models/User';
import { hashPassword, generateTokens } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ error: 'User already exists' });

  const hashed = await hashPassword(password);
  const user = await User.create({ email, password: hashed });

  const tokens = generateTokens(user._id.toString());

  return res.status(201).json({ message: 'User created', ...tokens });
}
