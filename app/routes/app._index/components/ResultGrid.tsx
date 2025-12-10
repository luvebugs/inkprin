import React from 'react';
import EyeIcon from "../../../assets/icons/eye.svg?react";
import DownloadIcon from "../../../assets/icons/download.svg?react";

interface ResultGridProps {
  generatedImages: string[];
  setPreviewImage: (image: string | null) => void;
  handleDownload: (imageUrl: string) => void;
}

export function ResultGrid({ generatedImages, setPreviewImage, handleDownload }: ResultGridProps) {
  if (generatedImages.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Generated Results</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {generatedImages.map((image, index) => (
          <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all">
            <img
              src={image}
              alt={`Generated tattoo ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setPreviewImage(image)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button
                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(image);
                }}
                title="Preview"
                type="button"
              >
                <EyeIcon width="20" height="20" />
              </button>
              <button
                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-sm backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(image);
                }}
                title="Download"
                type="button"
              >
                <DownloadIcon width="20" height="20" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
