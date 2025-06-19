import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BookmarksPage from "@/components/BookmarksPage";

function page() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className=" w-full  ">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar */}
          {/* <aside className="w-full md:w-60 shrink-0">
            <div className="sticky top-20">
              <h2 className="mb-4 text-xl font-semibold">Categories</h2>
              <CategoryFilter />
            </div>
          </aside> */}

          {/* Main content */}
          <div className="flex-1 overflow-visible relative z-0">
            <div className="flex items-center justify-between mb-6 z-10 relative">
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

            {/* BookmarksPage contains the DotPattern */}
            <BookmarksPage />
          </div>
        </div>
      </main>
    </div>
  );
}

export default page;
