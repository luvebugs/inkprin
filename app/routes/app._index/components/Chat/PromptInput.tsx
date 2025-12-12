import React, { useRef, useEffect } from 'react';
import SendIcon from "../../../../assets/icons/send.svg?react";
import UploadIcon from "../../../../assets/icons/upload.svg?react";
import InspirationIcon from "../../../../assets/icons/inspiration.svg?react";
import CloseIcon from "../../../../assets/icons/close.svg?react";

import styles from '../styles.module.css';

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onSurpriseMe?: () => void;
  uploadedImage?: File | null;
  handleRemoveImage?: () => void;

  handleSend?: () => void;
  onUploadClick?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function PromptInput({
  prompt,
  setPrompt,
  onSurpriseMe,
  uploadedImage,
  handleRemoveImage,
  handleSend,
  onUploadClick,
  disabled = false,
  placeholder = "Describe your dream tattoo in detail..."
}: PromptInputProps) {

  const imageUrl = uploadedImage ? window.URL.createObjectURL(uploadedImage) : null;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  // useEffect(() => {
  //   if (textareaRef.current) {
  //     textareaRef.current.style.height = "auto";
  //     textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  //   }
  // }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend?.();
    }
  };


  return (
    
        <div className={`rounded-xl bg-stone-100 shadow-none`}>
          <div className="relative w-full flex flex-col">
            <textarea
              ref={textareaRef}
              className={`${uploadedImage ? 'pt-14' : 'pt-3'} w-full min-h-[50px] max-h-[120px] p-3 pr-12 rounded-xl bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-base leading-relaxed resize-none custom-scrollbar`}
              placeholder={placeholder}
              value={prompt}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setPrompt(value);
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={1}
              maxLength={500}
              aria-label="Tattoo prompt"
            />

            {uploadedImage && imageUrl && (
              <div className="absolute top-3 left-5 flex gap-2 z-10">
                <div className="relative w-10 h-10 rounded-md overflow-hidden border border-gray-200 group bg-white">
                  <img src={imageUrl} alt="Upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage && handleRemoveImage(); }}
                    className="absolute top-0 right-0 bg-black/60 text-white p-0.5 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 h-5"
                  >
                    <CloseIcon width="10" height="10" />
                  </button>
                </div>
              </div>
            )}


            <div className="flex items-center justify-between px-2 pb-2 mt-1">
              <div className="flex items-center gap-2">
                {onUploadClick && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                    onClick={onUploadClick}
                    type="button"
                    title="Upload Reference"
                    disabled={disabled}
                    aria-label="Upload reference image"
                  >
                    <UploadIcon width="14" height="14" />
                    <span>Upload</span>
                  </button>
                )}

              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
                  {prompt.length}/500
                </span>
                {handleSend && (
                  prompt.length > 0 ? <button
                    type="button"
                    onClick={handleSend}
                    disabled={disabled || !prompt.trim()}
                    className={`p-2 rounded-full transition-all duration-200 ${prompt.trim() && !disabled
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    aria-label="Send prompt"
                  >
                    <SendIcon width="14" height="14" />
                  </button> : onSurpriseMe && (
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                      onClick={onSurpriseMe}
                      type="button"
                      title="Surprise me!"
                      disabled={disabled}
                      aria-label="Generate random prompt"
                    >
                      <InspirationIcon width="14" height="14" />
                      <span className="hidden sm:inline">Surprise Me</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

  );
}
