import BookmarksPage from "@/components/BookmarksPage";

interface BookmarkListProps {
  activeTab?: string;
}
const Page = ({ activeTab }: BookmarkListProps) => {
  console.log("active tab in first pass for page: ", activeTab);
  return <BookmarksPage activeTab={activeTab} />;
};

export default Page;
