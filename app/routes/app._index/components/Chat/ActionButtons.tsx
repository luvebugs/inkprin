import React from 'react';
import UploadIcon from "../../../../assets/icons/upload.svg?react";
import LoadingIcon from "../../../../assets/icons/loading.svg?react";
import GeneratorIcon from "../../../../assets/icons/generator.svg?react";
import DesignIcon from "../../../../assets/icons/design.svg?react";

interface ActionButtonsProps {
  handleGenerate: () => void;
  isLoading: boolean;
  prompt: string;
  onUploadClick: () => void;
  onToggleStyle: () => void;
}

export function ActionButtons({
  handleGenerate,
  isLoading,
  prompt,
  onUploadClick,
  onToggleStyle
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-2 sm:mt-4">
      <div className="flex gap-3 w-full sm:w-auto">
        <button
          className=" hidden sm:inline-flex relative w-full sm:w-fit bg-gray-100 hover:bg-gray-200 text-black rounded-full inset-ring-2 inset-ring-gray-300 cursor-pointer transition-all duration-0 flex items-center justify-center gap-2 px-4 py-3"
          onClick={onUploadClick}
          type="button"
        >
          <UploadIcon width="20" height="20" />
          <span className="whitespace-nowrap">Upload Reference</span>
        </button>
        <button
          type="button"
          onClick={onToggleStyle}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-full shadow-sm transition-all duration-200 group"
        >
          <span className="flex items-center gap-2">
            <DesignIcon className="w-4 h-4 text-indigo-500" />
            <span>Style & Design</span>
          </span>
        </button>
      </div>
      <button
        className="w-full sm:w-2/5 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-md font-medium relative rounded-full px-4 py-3 cursor-pointer"
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        type="button"
      >
        {isLoading ? (
          <>
            <LoadingIcon className="animate-spin h-5 w-5 text-white" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span className="whitespace-nowrap">Generate Tattoo</span>
            <GeneratorIcon width="20" height="20" />
          </>
        )}
      </button>
    </div>
  );
}
