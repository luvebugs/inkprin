import React from 'react';
import SparkleIcon from "../../../../assets/icons/sparkle.svg?react";
import CheckIcon from "../../../../assets/icons/check.svg?react";
import { TattooStyle, TattooColor, OutputFormat, AspectRatio } from "../../types";
import { stylesList, styleImages } from "../../constants";

interface StyleSelectorProps {
  selectedStyle: TattooStyle;
  setSelectedStyle: (style: TattooStyle) => void;
  selectedColor: TattooColor;
  setSelectedColor: (color: TattooColor) => void;
  selectedFormat: OutputFormat;
  setSelectedFormat: (format: OutputFormat) => void;
  selectedRatio: AspectRatio;
  setSelectedRatio: (ratio: AspectRatio) => void;
}

export function StyleSelector({ 
  selectedStyle, 
  setSelectedStyle,
  selectedColor,
  setSelectedColor,
  selectedFormat,
  setSelectedFormat,
  selectedRatio,
  setSelectedRatio
}: StyleSelectorProps) {

  const colorOptions: TattooColor[] = ["Colorful", "Black & White"];
  const formatOptions: OutputFormat[] = ["White paper", "Synthetic Skin Paper", "Forearm", "Hand", "Wrist", "Back", "Shoulder"];
  const ratioOptions: AspectRatio[] = ["1:1 Square", "9:16 Portrait", "16:9 Landscape"];

  return (
    <div className="flex flex-col gap-3 p-2 max-h-[400px] overflow-y-auto custom-scrollbar ">
      
      {/* Tattoo Style Section */}
      <div className="space-y-2">
         <h3 className="text-sm font-medium text-gray-700">Select Tattoo Style</h3>
         <div className="grid grid-auto-flow grid-flow-col gap-1 overflow-x-auto">
          {stylesList.map((style: TattooStyle | "No Style") => {
            const isPro = ["Ghibli", "Couple", "Creepy", "Dotwork"].includes(style);
            const isSelected = selectedStyle === style;
            return (
              <button
                key={style}
                className={`group relative flex flex-col items-center justify-center rounded-sm transition-all cursor-pointer aspect-square gap-1 ${isSelected ? "" : "bg-white"}`}
                onClick={() => setSelectedStyle(style)}
                type="button"
              >
                {isPro && (
                  <div className="absolute top-0 left-0 flex items-center gap-0.5 px-1.5 py-0.3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full shadow-sm z-10 scale-75 origin-top-left">
                    <span className="leading-[16px] text-[10px]">PRO</span>
                  </div>
                )}
                <div className={`size-10 sm:size-12 rounded-full overflow-hidden flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-stone-500 shadow-md' : 'bg-gray-100 group-hover:shadow-md'}`}>
                  {style === "No Style" ? (
                    <div className={`p-2 rounded-full transition-colors ${isSelected ? 'bg-stone-100 text-stone-600' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-500'}`}>
                      <SparkleIcon width="20" height="20" />
                    </div>
                  ) : (
                    <img
                      src={styleImages[style]}
                      alt={style}
                      className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                  {isSelected && (
                    <div className="absolute top-1 right-1 text-white bg-black rounded-full p-0.5 shadow-sm z-10 scale-75">
                      <CheckIcon width="12" height="12" />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] text-center leading-tight ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-600'}`}>{style}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tattoo Color Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Select Your Tattoo Color</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                selectedColor === color
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Output Format Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Choose Output Format</h3>
        <div className="flex flex-wrap gap-2">
          {formatOptions.map((format) => (
            <button
              key={format}
              onClick={() => setSelectedFormat(format)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                selectedFormat === format
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {format}
            </button>
          ))}
        </div>
      </div>

      {/* Aspect Ratio Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Aspect Ratio</h3>
        <div className="flex flex-wrap gap-2">
          {ratioOptions.map((ratio) => (
            <button
              key={ratio}
              onClick={() => setSelectedRatio(ratio)}
              className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                selectedRatio === ratio
                  ? 'bg-black text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {/* Simple icons based on ratio */}
              <div className={`border-2 ${selectedRatio === ratio ? 'border-white' : 'border-gray-500'} rounded-sm ${
                ratio.includes("Square") ? "w-3 h-3" : 
                ratio.includes("Portrait") ? "w-2 h-3" : 
                "w-3 h-2"
              }`}></div>
              {ratio}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
