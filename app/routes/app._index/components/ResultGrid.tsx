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

  const mainImage = generatedImages[0];
  const thumbnails = generatedImages.slice(1);

  const renderImageActions = (image: string) => (
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
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-row gap-4">
        {/* Main Image */}
        <div className="flex-1 min-w-0">
          <div className="group relative w-full aspect-square rounded-3xl bg-stone-100/30 backdrop-blur-3xl border border-zinc-200 shadow-md p-2 transition-all hover:shadow-xl hover:scale-[1.01]">
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <img
                src={mainImage}
                alt="Main generated tattoo"
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setPreviewImage(mainImage)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
              {renderImageActions(mainImage)}
            </div>
          </div>
        </div>

        {/* Thumbnails */}
        {thumbnails.length > 0 && (
          <div className="w-1/3 relative flex-shrink-0">
            <div className="absolute inset-0 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 gap-4 content-start">
                {thumbnails.map((image, index) => (
                  <div key={index} className="group relative aspect-square rounded-3xl bg-stone-100 backdrop-blur-xl border border-zinc-200 shadow-md p-2 transition-all hover:shadow-lg hover:scale-[1.01]">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <img
                        src={image}
                        alt={`Generated tattoo thumbnail ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewImage(image)}
                      />
                      {renderImageActions(image)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='w-full'>
        <h3 className="text-lg font-medium text-gray-700">Familier Tattoos</h3>

        <div className="grid grid-auto-flow grid-flow-col gap-3 overflow-x-auto custom-scrollbar mt-3 mb-3">
          {thumbnails.map((image, index) => (
            <div key={index} className="h-[240px] group relative aspect-square rounded-xl bg-stone-100 backdrop-blur-xl border border-zinc-200 shadow-md p-2 transition-all hover:shadow-lg">
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt={`Generated tattoo thumbnail ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setPreviewImage(image)}
                />
                {renderImageActions(image)}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
