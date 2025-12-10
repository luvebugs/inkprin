import React from 'react';
import SparkleIcon from "../../../assets/icons/sparkle.svg?react";
import CheckIcon from "../../../assets/icons/check.svg?react";
import { TattooStyle } from "../types";
import { stylesList, styleImages } from "../constants";

interface StyleSelectorProps {
  selectedStyle: TattooStyle;
  setSelectedStyle: (style: TattooStyle) => void;
}

export function StyleSelector({ selectedStyle, setSelectedStyle }: StyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Select Style</h3>
        <span className="text-sm text-gray-500">{selectedStyle}</span>
      </div>
      <div className="grid auto-cols-auto grid-flow-row gap-3 p-1" style={{ grid: "auto / auto-flow max-content", overflow: "auto" }}>
        {stylesList.map((style) => {
          const isPro = ["Ghibli", "Couple", "Creepy", "Dotwork"].includes(style);
          const isSelected = selectedStyle === style;
          return (
            <button
              key={style}
              className={`group relative flex flex-col items-center justify-center rounded-sm transition-all cursor-pointer aspect-square gap-2 ${isSelected
                ? ""
                : "bg-white"
                }`}
              onClick={() => setSelectedStyle(style)}
              type="button"
            >
              {isPro && (
                <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm z-10">
                  <span>PRO</span>
                </div>
              )}
              <div className={`rounded-full overflow-hidden w-16 h-16 flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-stone-500 shadow-md' : 'bg-gray-100 group-hover:shadow-md'}`}>
                {style === "No Style" ? (
                  <div className={`p-2 rounded-full transition-colors ${isSelected ? 'bg-stone-100 text-stone-600' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-500'}`}>
                    <SparkleIcon width="24" height="24" />
                  </div>
                ) : (
                  <img
                    src={styleImages[style]}
                    alt={style}
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
                  />
                )}
                {isSelected && (
                  <div className="absolute top-1 right-2 text-white bg-black rounded-full p-0.5 shadow-sm z-10">
                    <CheckIcon width="12" height="12" />
                  </div>
                )}
              </div>
              <span className={`text-xs text-center ${isSelected ? 'text-indigo-900 font-medium' : 'text-gray-600'}`}>{style}</span>

            </button>
          );
        })}
      </div>
    </div>
  );
}
