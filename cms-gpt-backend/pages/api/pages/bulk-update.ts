import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/db';
import Page from '../../../models/page';
import { authenticate } from '@/lib/auth';
import { SEOResponse } from '@/types/page';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    try {
        await authenticate(req, res);
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    let pages;
    try {
        await connectDB();
    } catch (dbError) {
        console.log('Database connection error:', dbError);
        return res.status(500).json({ message: 'Database connection failed' });
    }

    const { pageIds, prompt } = req.body;
    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0 || !prompt) {
        return res.status(400).json({ message: 'pageIds and prompt are required and pageIds must be a non-empty array' });
    }

    try {
        pages = await Page.find({ _id: { $in: pageIds } });
    } catch (dbError) {
        console.log('Error fetching pages from DB:', dbError);
        return res.status(500).json({ message: 'Error fetching pages from database' });
    }

    const bulkPrompt = `
Apply this instruction: "${prompt}" 
to each of the following pages and return updated metadata (meta_title, meta_description, keywords) and improved title if possible in JSON list format.

${pages.map((p, i) => `Page ${i + 1}: Title: ${p.title}, Content: ${p.content}`).join('\n\n')}
`;

    let gptData: SEOResponse[] = [];
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: bulkPrompt }],
        });

        if (!response || !response.choices || response.choices.length === 0) {
            console.log('Invalid response from OpenAI API:', response);
            return res.status(500).json({ message: 'Invalid response from OpenAI API' });
        }
        const contentStr = response.choices?.[0]?.message?.content;
        console.log(contentStr)
        if (!contentStr || typeof contentStr !== 'string') {
            console.error('Invalid or empty OpenAI content:', contentStr);
            return null;
        }

        try {
            gptData = JSON.parse(contentStr.trim());
        } catch (jsonError) {
            console.log('Error parsing OpenAI response:', jsonError);
            console.log('Raw response content:', response.choices[0].message.content);
            return res.status(500).json({ message: 'Error parsing response from OpenAI' });
        }
    } catch (apiError) {
        console.log('OpenAI API error:', apiError);
        return res.status(500).json({ message: 'OpenAI API request failed' });
    }

    let ops;
    try {
        console.log(gptData)
        ops = gptData.map((data, i) => ({
            updateOne: {
                filter: { _id: pages[i]._id },
                update: {
                    $set: {
                        title: data?.title || pages[i].title,
                        meta_title: data?.meta_title,
                        meta_description: data?.meta_description,
                        keywords: data?.keywords,
                    },
                },
            },
        }));
    } catch (error) {
        console.log('Error preparing bulk update operations:', error);
        return res.status(500).json({ message: 'Error preparing bulk update operations' });
    }

    try {
        await Page.bulkWrite(ops);
        return res.status(200).json({message:"Data Updated Successfully", updated: ops.length });
    } catch (dbError) {
        console.log('Error updating pages in DB:', dbError);
        return res.status(500).json({ message: 'Bulk update failed in database' });
    }
}
