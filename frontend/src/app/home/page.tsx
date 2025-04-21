import { Search } from "lucide-react";
import BookmarkGrid from "@/components/bookmark-grid";
import CategoryFilter from "@/components/category-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserProfileSection from "@/components/user-profile-section";
function page() {
  return (
    <div className="min-h-screen w-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-300 bg-gradient-to-br from-gray-300 to-gray-200 text-white border-b border-gray-200">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="relative flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your bookmarks..."
                className="w-full pl-10 pr-4 bg-gray-100 rounded-full border-gray-300 focus:border-b-emerald-950 focus:ring-emerald-950"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-gray-300 bg-gray-100 text-[#202A29]"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New
            </Button>
            {/* <UserProfileSection /> */}
          </div>
        </div>
      </header>

      <main className=" w-full  py-8 ">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-60 shrink-0">
            <div className="sticky top-20">
              <h2 className="mb-4 text-xl font-semibold">Categories</h2>
              <CategoryFilter />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Your Bookmarks</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  Latest
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  Popular
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  Unread
                </Button>
              </div>
            </div>

            <BookmarkGrid />
          </div>
        </div>
      </main>
    </div>
  );
}

export default page;
