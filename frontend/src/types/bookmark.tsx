export interface Bookmark {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  category: string;
  savedAt: string;
  readTime: string;
  favicon: string | any; //temp for now: Ari
  tags: any; // if we do categorization
  ai_summary: "to be integrated";
}
