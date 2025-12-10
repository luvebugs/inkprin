import React from 'react';
import SparkleIcon from "../../../assets/icons/sparkle.svg?react";
import UploadIcon from "../../../assets/icons/upload.svg?react";
import CloseIcon from "../../../assets/icons/close.svg?react";
import styles from '../styles.module.css';

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSurpriseMe: () => void;
  uploadedImage: File | null;
  handleRemoveImage: () => void;
  setShowDesignChoicesModal?: (value: boolean) => void;
}

export function PromptInput({
  prompt,
  setPrompt,
  handleSurpriseMe,
  uploadedImage,
  handleRemoveImage,
  setShowDesignChoicesModal
}: PromptInputProps) {
    
  const imageUrl = uploadedImage ? window.URL.createObjectURL(uploadedImage) : null;

  return (
    <div className={`${styles.panel} rounded-xl sm:rounded-2xl`}>
      <div className={`${styles.inner} rounded-xl sm:rounded-2xl`}>
        <div className={`rounded-xl sm:rounded-2xl p-0 sm:p-4  border border-gray-100 shadow-sm bg-white`}>
          {/* Text Input with Surprise Me Button */}
          <div className="relative w-full flex">
            <textarea
              className={`w-full min-h-[140px] p-5 ${uploadedImage ? 'pt-14' : 'pt-5'} rounded-xl bg-gray-100 text-gray-900 ring-0 ring-inset placeholder:text-gray-400 focus:ring focus:ring-inset focus:ring-indigo-400 sm:text-base leading-relaxed resize-none outline-none transition-shadow`}
              placeholder="Describe your dream tattoo in detail... (e.g., 'A minimalist line art wolf howling at the moon with geometric shapes')"
              value={prompt}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setPrompt(value);
                }
              }}
              rows={4}
              maxLength={500}
            />
            
            {uploadedImage && imageUrl && (
              <div className="absolute top-3 left-5 flex gap-2 z-10">
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 group bg-white">
                    <img src={imageUrl} alt="Upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                      className="absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 h-5"
                    >
                      <CloseIcon width="10" height="10" />
                    </button>
                  </div>
              </div>
            )}

            <div className="absolute bottom-3 px-3 flex items-center gap-2 w-full justify-between flex-nowrap">
              <div>
                {setShowDesignChoicesModal && (
                    <button
                    className="inline-flex sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-300 text-xs font-semibold transition-colors"
                    onClick={() => setShowDesignChoicesModal(true)}
                    type="button"
                    title="Upload Reference"
                    >
                    <UploadIcon width="12" height="12" />
                    <span>Upload</span>
                    </button>
                )}
              </div>
              <div className="flex flex-nowrap items-center justify-between gap-[inherit]">
                <span className="text-xs text-gray-400 font-medium">
                  {prompt.length}/∞
                </span>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-300 text-xs font-semibold transition-colors"
                  onClick={handleSurpriseMe}
                  type="button"
                  title="Surprise me!"
                >
                  <SparkleIcon width="14" height="14" />
                  <span className="hidden sm:inline">Surprise Me</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
