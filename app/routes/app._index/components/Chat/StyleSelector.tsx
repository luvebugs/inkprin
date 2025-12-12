import React from 'react';
import SparkleIcon from "../../../../assets/icons/sparkle.svg?react";
import CheckIcon from "../../../../assets/icons/check.svg?react";
import { TattooStyle } from "../../types";
import { stylesList, styleImages } from "../../constants";

interface StyleSelectorProps {
  selectedStyle: TattooStyle;
  setSelectedStyle: (style: TattooStyle) => void;
}

export function StyleSelector({ selectedStyle, setSelectedStyle }: StyleSelectorProps) {
  return (
      <div className="grid auto-cols-auto grid-flow-row gap-3 p-1 mt-2" style={{ grid: "auto / auto-flow", overflow: "auto" }}>
        {stylesList.map((style: TattooStyle | "No Style") => {
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
                <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full shadow-sm z-10">
                  <span className="leading-[16px] text-[10px]">PRO</span>
                </div>
              )}
              <div className={`size-8 sm:size-12 rounded-full overflow-hidden flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-stone-500 shadow-md' : 'bg-gray-100 group-hover:shadow-md'}`}>
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
  );
}
