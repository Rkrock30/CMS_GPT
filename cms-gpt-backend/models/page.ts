import mongoose, { Document, Schema } from 'mongoose';

export interface IPage extends Document {
  title: string;
  content: string;
  category?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
}

const PageSchema = new Schema<IPage>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: String,
  meta_title: String,
  meta_description: String,
  keywords: [String],
});

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);
