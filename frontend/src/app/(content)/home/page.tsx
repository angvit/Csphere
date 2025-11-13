import BookmarksPage from "@/components/BookmarksPage";

interface BookmarkListProps {
  activeTab?: string;
}
const Page = ({ activeTab }: BookmarkListProps) => {
  return <BookmarksPage activeTab={activeTab} />;
};

export default Page;
