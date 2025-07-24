"use client";
import { useState } from "react";
import Image from "next/image";

function page() {
  const [openSteps, setOpenSteps] = useState({});

  const toggleStep = (stepNumber) => {
    setOpenSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const steps = [
    {
      number: 1,
      title: "Download the Chrome Extension",
      description:
        "First, download the extension file from your account dashboard or the provided download link.",
      instructions: [
        'Look for the "Download Extension" button on your dashboard',
        "Save the .zip file to your Downloads folder",
      ],
      media: {
        type: "image", // or "video"
        src: "/images/step1-download.png", // Replace with your actual image path
        alt: "Download extension screenshot",
      },
    },
    {
      number: 2,
      title: "Open Chrome Extension Tools",
      description:
        "Navigate to Chrome's extension management page to prepare for installation.",
      instructions: [
        "Open Chrome and go to chrome://extensions/ manually",
        "Or go to Chrome Menu > More Tools > Extensions",
      ],
      media: {
        type: "video", // or "image"
        src: "/videos/step2-navigate.mp4", // Replace with your actual video path
        poster: "/images/step2-poster.png", // Optional poster image for video
      },
    },
    {
      number: 3,
      title: "Enable Developer Mode",
      description:
        "Toggle the Developer mode switch to allow installation of unpacked extensions.",
      instructions: [
        'Look for "Developer mode" toggle in the top-right corner',
        "Click to enable it (switch should turn blue)",
      ],
      media: {
        type: "image",
        src: "/images/step3-developer-mode.png",
        alt: "Developer mode toggle screenshot",
      },
    },
    {
      number: 4,
      title: "Unpack the Extension File",
      description: "Extract the downloaded zip file and load it into Chrome.",
      instructions: [
        "Extract the .zip file to a folder on your computer",
        'Click "Load unpacked" button',
        "Select the extracted folder containing the extension files",
      ],
      media: {
        type: "video",
        src: "/videos/step4-unpack.mp4",
        poster: "/images/step4-poster.png",
      },
    },
    {
      number: 5,
      title: "Login with Your Credentials",
      description:
        "Use the same login credentials you used when signing up on the main website.",
      instructions: [
        "Click on the extension icon in your browser toolbar",
        "Enter your email and password from your main account",
        'Click "Sign In" to complete the setup',
      ],
      media: {
        type: "image",
        src: "/images/step5-login.png",
        alt: "Extension login screenshot",
      },
    },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-300 text-white pt-serif">
      <div className="min-h-screen w-full flex items-center justify-center p-6 mt-32">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <h1 className="pt-serif-bold text-4xl mb-4">
              Chrome Extension Setup
            </h1>
            <p className="text-gray-300 text-lg">
              Follow these simple steps to install and configure your extension
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white/5 rounded-lg border border-white/10 shadow"
              >
                {/* Step Header */}
                <div
                  className="flex items-start gap-6 p-8 cursor-pointer"
                  onClick={() => toggleStep(step.number)}
                >
                  <div className="bg-white text-[#202A29] rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                      <svg
                        className={`w-6 h-6 transition-transform ${
                          openSteps[step.number] ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-300 mb-4">{step.description}</p>
                  </div>
                </div>

                {/* Expandable Content */}
                {openSteps[step.number] && (
                  <div className="px-8 pb-8">
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                      {/* Instructions */}
                      <div>
                        <div className="bg-black/20 rounded-md p-4 font-mono text-sm">
                          {step.instructions.map((instruction, index) => (
                            <div key={index} className="mb-2 last:mb-0">
                              • {instruction}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Media */}
                      <div className="bg-black/10 rounded-lg p-4">
                        {step.media.type === "image" ? (
                          <div className="relative w-full h-64 bg-gray-700 rounded-lg overflow-hidden">
                            <Image
                              src={step.media.src}
                              alt={step.media.alt}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        ) : (
                          <div className="relative w-full h-64 bg-gray-700 rounded-lg overflow-hidden">
                            <video
                              className="w-full h-full object-contain"
                              controls
                              poster={step.media.poster}
                              preload="metadata"
                            >
                              <source src={step.media.src} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          {step.media.type === "image"
                            ? "Click to expand"
                            : "Video demonstration"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
