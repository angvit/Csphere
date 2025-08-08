interface Tag {
  category_id: string;
  category_name: string;
}

export interface Bookmark {
  content_id: string;
  title?: string;
  url: string;
  source?: string;
  ai_summary?: string;
  first_saved_at?: string; // ISO timestamp, might also be Date if parsed
  tags?: Tag[];
  notes?: string;
}
