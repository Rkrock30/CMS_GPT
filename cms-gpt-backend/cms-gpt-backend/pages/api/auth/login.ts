import { NextApiRequest, NextApiResponse } from 'next';
import {connectDB} from '../../../lib/db';
import User from '@/models/User';
import { comparePassword, generateTokens } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const tokens = generateTokens(user._id.toString());

  return res.status(200).json({ message: 'Login successful', ...tokens });
}
