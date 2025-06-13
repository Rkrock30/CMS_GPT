import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import Page from '../../../../../models/page';
import { generateSEOMetadata } from '@/lib/openai';
import { authenticate } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
try {
  await authenticate(req, res);
} catch (error) {
  return res.status(401).json({ error: 'Unauthorized' });
}

  await connectDB();


  const { id } = req.query;
  const page = await Page.findById(id);
  console.log(page)
  if (!page) return res.status(200).json({ message: 'Page not found' });

  const metadata = await generateSEOMetadata({
    title: page.title,
    content: page.content,
    category: page.category,
  });

  if (!metadata) return res.status(500).json({ message: 'Failed to generate metadata' });

  Object.assign(page, metadata);
  await page.save();

  return res.status(200).json(metadata);
}
