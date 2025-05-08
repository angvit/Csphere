import BookmarkCard from "./BookmarkCard";

type Bookmark = {
  content_id: string;
  title?: string;
  source?: string;
  ai_summary?: string;
  url: string;
};

export default function BookmarkList({ items }: { items: Bookmark[] }) {
  if (items.length === 0) {
    return <p className="text-center text-gray-500">No bookmarks found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <BookmarkCard key={item.content_id} item={item} />
      ))}
    </div>
  );
}
