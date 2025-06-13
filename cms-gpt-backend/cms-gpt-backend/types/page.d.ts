export interface SEOResponse {
  meta_title: string;
  meta_description: string;
  keywords: string[];
  title?: string; // for bulk updates
}
