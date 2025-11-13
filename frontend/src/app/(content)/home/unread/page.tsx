import UnreadBookmarksPage from "@/components/UnreadBookmarksPage";

type ChildProps = {
  activeTab?: string;
};
const Page: React.FC<ChildProps> = ({ activeTab }) => {
  return <UnreadBookmarksPage activeTab={activeTab} />;
};

export default Page;

// function page() {
//   return <UnreadBookmarksPage />;
// }

// export default page;
