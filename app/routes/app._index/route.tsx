import { useState, useRef, useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import styles from './styles.module.css'
import { saveImageToDB, getAllImagesFromDB, type SavedImage } from "../../utils/indexedDB";

import GeneratorIcon from "../../assets/icons/generator.svg?react";
import SparkleIcon from "../../assets/icons/sparkle.svg?react";
import StyleIcon from "../../assets/icons/style.svg?react";
import CheckIcon from "../../assets/icons/check.svg?react";
import UploadIcon from "../../assets/icons/upload.svg?react";
import LoadingIcon from "../../assets/icons/loading.svg?react";
import CloseIcon from "../../assets/icons/close.svg?react";
import PlusIcon from "../../assets/icons/plus.svg?react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

type TattooStyle =
  | "No Style"
  | "Ghibli"
  | "Couple"
  | "Creepy"
  | "Egypt"
  | "Paganic"
  | "Flame Design"
  | "Chicano"
  | "Monospace Text"
  | "Geometric"
  | "Spiritual"
  | "Dotwork"
  | "Minimalist"
  | "Traditional"
  | "Watercolor"
  | "Japanese";

const surprisePrompts = [
  "A detailed floral forearm piece with a compass in a black and grey style",
  "A geometric mandala design with intricate patterns and symmetry",
  "A watercolor-style dragon wrapped around the arm with vibrant colors",
  "A minimalist line art portrait of a wolf howling at the moon",
  "A traditional Japanese koi fish swimming upstream with cherry blossoms",
  "An abstract geometric design with bold black lines and negative space",
  "A realistic portrait tattoo with dramatic shading and depth",
  "A neo-traditional rose with bold colors and decorative elements",
];

export default function TattooGenerator() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<TattooStyle>("No Style");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showDesignChoicesModal, setShowDesignChoicesModal] = useState(false);
  const [historyImages, setHistoryImages] = useState<SavedImage[]>([]);
  const submittingPromptRef = useRef("");
  const submittingStyleRef = useRef("");

  const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";

  // Load from DB on mount
  useEffect(() => {
    getAllImagesFromDB().then((images) => {
      setHistoryImages(images);
    });
  }, []);

  // Sync fetcher data to state and DB
  const generatedImage = fetcher.data?.imageUrl || fetcher.data?.imageData;
  useEffect(() => {
    if (generatedImage) {
      const promptUsed = submittingPromptRef.current || prompt;
      const styleUsed = submittingStyleRef.current || selectedStyle;
      
      // Avoid adding duplicate if the effect runs multiple times for same image
      // Simple check: compare with latest image URL
      setHistoryImages(prev => {
        if (prev.length > 0 && prev[0].url === generatedImage) {
            return prev;
        }
        
        const newItem: SavedImage = {
            id: Date.now().toString(),
            url: generatedImage,
            timestamp: Date.now(),
            prompt: promptUsed,
            style: styleUsed
        };
        
        saveImageToDB(generatedImage, promptUsed, styleUsed);
        return [newItem, ...prev];
      });
    }
  }, [generatedImage]); // Only run when generatedImage changes

  useEffect(() => {
    if (fetcher.data?.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    } else if (fetcher.data?.success) {
      shopify.toast.show("Tattoo design generated successfully!");
    }
  }, [fetcher.data, shopify]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
        if (uploadedImages.length + validFiles.length < 2) {
          validFiles.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              previews.push(e.target.result as string);
              if (previews.length === validFiles.length) {
                setImagePreviews((prev) => [...prev, ...previews]);
              }
            }
          };
          reader.readAsDataURL(file);
        }
      }
    });

    setUploadedImages((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSurpriseMe = () => {
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setPrompt(randomPrompt);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      shopify.toast.show("Please enter a description", { isError: true });
      return;
    }

    submittingPromptRef.current = prompt;
    submittingStyleRef.current = selectedStyle;

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("style", selectedStyle);
    uploadedImages.forEach((image) => {
      formData.append("images", image);
    });

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/generate-tattoo",
      encType: "multipart/form-data",
    });
  };

  const stylesList: TattooStyle[] = [
    "No Style",
    "Ghibli",
    "Couple",
    "Creepy",
    "Egypt",
    "Paganic",
    "Flame Design",
    "Chicano",
    "Monospace Text",
    "Geometric",
    "Spiritual",
    "Dotwork",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-10 flex flex-col gap-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              AI Tattoo Generator
            </h1>
            <p className="text-gray-500 text-lg">
              Turn your ideas into unique tattoo designs in seconds
            </p>
          </div>

          {/* Control Panel */}
          <div className={`${styles.panel} rounded-xl sm:rounded-2xl`}>
            <div className={`${styles.inner} rounded-xl sm:rounded-2xl`}>
              <div className={`rounded-xl sm:rounded-2xl p-0 sm:p-4  border border-gray-100 shadow-sm bg-white`}>
                {/* Text Input with Surprise Me Button */}
                <div className="relative w-full flex">
                  <textarea
                    className="w-full min-h-[140px] p-5 pb-14 rounded-xl bg-gray-100 text-gray-900 ring-0 ring-inset placeholder:text-gray-400 focus:ring focus:ring-inset focus:ring-indigo-400 sm:text-base leading-relaxed resize-none outline-none transition-shadow"
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
                  <div className="absolute bottom-3 px-3 flex items-center gap-2 w-full justify-between flex-nowrap">
                    <div>
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-300 text-xs font-semibold transition-colors"
                        onClick={handleSurpriseMe}
                        type="button"
                        title="Surprise me!"
                      >
                        <UploadIcon width="12" height="12" fill="#4f39f6"/>
                        <span>Upload</span>
                      </button>
                    </div>
                    <div className="flex flex-nowrap items-center justify-between gap-[inherit]">
                      <span className="text-xs text-gray-400 font-medium">
                        {prompt.length}/500
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
          {/* Style Selection Panel */}
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
                      ? "bg-indigo-50/50 ring ring-indigo-400 shadow-sm"
                      : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    onClick={() => setSelectedStyle(style)}
                    type="button"
                  >
                    {isPro && (
                      <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                        <span>PRO</span>
                      </div>
                    )}
                    <div className={`p-2 rounded-full transition-colors ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-indigo-500'}`}>
                      {style === "No Style" ? (
                        <SparkleIcon width="24" height="24" />
                      ) : (
                        <StyleIcon width="24" height="24" />
                      )}
                    </div>
                    <span className={`text-xs text-center ${isSelected ? 'text-indigo-900' : 'text-gray-600'}`}>{style}</span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 text-indigo-600">
                        <CheckIcon width="16" height="16" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                className="relative w-full sm:w-fit bg-gray-100 hover:bg-gray-200 text-black rounded-full border-2 border-solid border-gray-300 cursor-pointer transition-all duration-0 flex items-center justify-center gap-2 px-4 py-3"
                onClick={() => setShowDesignChoicesModal(true)}
                type="button"
              >
                <UploadIcon width="18" height="18" />
                <span>Upload Reference</span>
              </button>
            </div>
            <button
              className="w-full sm:w-3/5 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100 transition-all shadow-md font-medium relative rounded-full px-4 py-3 cursor-pointer"
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
                  <span>Generate Tattoo</span>
                  <GeneratorIcon width="20" height="20" />
                </>
              )}
            </button>
          </div>
        </div>




        {/* Result Area */}
        {historyImages.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 p-8 flex flex-col items-center w-full">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Your Generated Designs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              {historyImages.map((img) => (
                <div key={img.id} className="relative group bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
                  <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
                    <img
                        src={img.url}
                        alt={`Tattoo ${img.prompt}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            {img.style || "No Style"}
                        </span>
                        <span className="text-xs text-gray-400">
                            {new Date(img.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-2 font-medium" title={img.prompt}>
                        {img.prompt || "No description"}
                    </p>
                    
                    <a
                        href={img.url}
                        download={`tattoo-${img.id}.png`}
                        className="mt-3 w-full text-center bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Design Choices Modal */}
        {showDesignChoicesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDesignChoicesModal(false)}>
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Upload Reference Images</h3>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setShowDesignChoicesModal(false)}
                  type="button"
                >
                  <CloseIcon width="20" height="20" />
                </button>
              </div>
              <div className="p-6">
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                    }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  {imagePreviews.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <UploadIcon width="32" height="32" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">Click to upload or drag & drop</p>
                        <p className="text-gray-500 text-sm mt-1">Max 2 images, 5MB each</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                            type="button"
                          >
                            <CloseIcon width="16" height="16" />
                          </button>
                        </div>
                      ))}
                      {uploadedImages.length < 2 && (
                        <div
                          className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                        >
                          <PlusIcon width="24" height="24" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
