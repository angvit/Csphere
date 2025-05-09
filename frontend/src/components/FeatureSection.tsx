import Image from "next/image";
import { Bookmark, Globe, FolderTree } from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      icon: <Bookmark className="h-5 w-5 text-black" />,
      title: "Save and organize your research",
      desc: "Collect articles, papers, and resources from across the web in one centralized location. Never lose track of important information again.",
      imageAlt: "Bookmark collection interface",
      imageSrc: "/placeholder.svg",
    },
    {
      icon: <Globe className="h-5 w-5 text-black" />,
      title: "Access your content anywhere",
      desc: "Seamlessly sync your saved content across all your devices. Your bookmarks are always available whether you're at home, work, or on the go.",
      imageAlt: "Cross-device synchronization",
      imageSrc: "/placeholder.svg",
    },
    {
      icon: <FolderTree className="h-5 w-5 text-black" />,
      title: "Organize with smart collections",
      desc: "Create custom collections and let our AI help categorize your content automatically. Find what you need when you need it with powerful search and filtering.",
      imageAlt: "Smart collections and organization",
      imageSrc: "/placeholder.svg",
    },
  ];

  return (
    <div className="w-full bg-black text-white">
      {/* Pronunciation Header */}
      <div className="text-center py-16">
        <p className="text-3xl md:text-4xl font-normal tracking-tight !text-white">
          Pronounced{" "}
          <span className="italic font-bold !text-white">see sphere</span>
        </p>
      </div>

      {features.map((feature, index) => (
        <section
          key={index}
          className="w-full py-16 md:py-24 border-t border-gray-800"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {index === 1 ? (
                <>
                  <ImageBlock feature={feature} />
                  <TextBlock feature={feature} />
                </>
              ) : (
                <>
                  <TextBlock feature={feature} />
                  <ImageBlock feature={feature} />
                </>
              )}
            </div>
          </div>
        </section>
      ))}

      <div className="w-full py-16 text-center border-t border-gray-800">
        <a
          href="https://chrome.google.com/webstore/detail/EXTENSION_ID"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-black font-semibold text-lg px-6 py-3 rounded-lg hover:bg-gray-200 transition"
        >
          Download Chrome Extension
        </a>
      </div>
    </div>
  );
}

function TextBlock({ feature }) {
  return (
    <div className="flex flex-col justify-center space-y-6 max-w-xl mx-auto lg:mx-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
          {feature.icon}
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight !text-white">
          {feature.title}
        </h2>
      </div>
      <p className="text-lg md:text-xl leading-relaxed !text-white">
        {feature.desc}
      </p>
    </div>
  );
}

function ImageBlock({ feature }) {
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[500px]">
        <div className="relative z-10 overflow-hidden rounded-lg bg-gray-900 p-6 shadow-sm">
          <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-700">
            <Image
              src={`${feature.imageSrc}?height=400&width=400`}
              width={400}
              height={400}
              alt={feature.imageAlt}
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
