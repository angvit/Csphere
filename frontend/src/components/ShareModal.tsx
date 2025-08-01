import React from "react";
import { BookmarkDetailModal } from "@/app/components/bookmark/BookmarkModel";

const ShareModal = ({ onClose, bookmarkUrl }) => {
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(bookmarkUrl);
    switch (platform) {
      case "gmail":
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(
            "Check out this bookmark from CSphere"
          )}&body=${encodeURIComponent(
            "I bookmarked this on CSphere: " + bookmarkUrl
          )}`,
          "_blank"
        );
        break;
      default:
        console.warn("Unknown platform:", platform);
    }
    onClose();
  };

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(bookmarkUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 ">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Share</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            x
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Slack Button */}
          <button
            onClick={() => handleShare("slack")}
            className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-lg text-[15px] w-full"
          >
            <img
              src="https://www.google.com/s2/favicons?domain=slack.com&sz=32"
              alt="Slack"
              className="w-8 h-8 mb-1.5"
            />
            <span className="whitespace-nowrap">
              Slack
              <br />
              (coming)
            </span>
          </button>

          {/* Instagram Button */}
          <button
            onClick={() => handleShare("instagram")}
            className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-lg text-[15px] w-full"
          >
            <img
              src="https://www.google.com/s2/favicons?domain=instagram.com&sz=32"
              alt="Instagram"
              className="w-8 h-8 mb-1.5"
            />
            <span className="whitespace-nowrap">
              Instagram
              <br />
              (coming){" "}
            </span>
          </button>

          {/* Gmail Button */}
          <button
            onClick={() => handleShare("gmail")}
            className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-lg text-[15px] w-full"
          >
            <img
              src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
              alt="Gmail"
              className="w-8 h-8 mb-1.5"
            />
            <span className="whitespace-nowrap">Gmail</span>
          </button>
        </div>

        <div className="flex">
          <input
            type="text"
            value={bookmarkUrl}
            readOnly
            className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-[15px]"
          />
          <button
            onClick={handleCopyUrl}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 text-[15px]"
          >
            {copiedUrl ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
