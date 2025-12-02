import { useState, useRef, useEffect } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

type TattooStyle = "Minimalist" | "Traditional" | "Watercolor" | "Geometric" | "Japanese";

export default function TattooGenerator() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<TattooStyle>("Minimalist");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const isLoading = fetcher.state === "submitting" || fetcher.state === "loading";
  const generatedImage = fetcher.data?.imageUrl || fetcher.data?.imageData;

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

  const handleGenerate = () => {
    if (!prompt.trim()) {
      shopify.toast.show("Please enter a description", { isError: true });
      return;
    }

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
    "Minimalist",
    "Traditional",
    "Watercolor",
    "Geometric",
    "Japanese",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.brand}>inkprin</h1>
        <p className={styles.subtitle}>AI Custom Tattoo Generator</p>
      </div>

      <div className={styles.content}>
        {/* Text Input Area */}
        <div className={styles.inputSection}>
          <textarea
            className={styles.textInput}
            placeholder="Describe your dream tattoo (e.g., a detailed floral forearm piece with a compass in a black and grey style)"
            value={prompt}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 300) {
                setPrompt(value);
              }
            }}
            rows={6}
            maxLength={300}
          />
          <div className={styles.charCount}>
            {prompt.length}/300
          </div>
        </div>

        {/* Image Upload Area */}
        <div
          className={`${styles.uploadArea} ${isDragging ? styles.dragging : ""}`}
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
            style={{ display: "none" }}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          {imagePreviews.length === 0 ? (
            <>
              <svg
                className={styles.uploadIcon}
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className={styles.uploadText}>
                Click to upload or drag & drop here
              </p>
              <p className={styles.uploadHint}>
                (Max 2 images, 5MB each)
              </p>
            </>
          ) : (
            <div className={styles.imagePreviews}>
              {imagePreviews.map((preview, index) => (
                <div key={index} className={styles.imagePreviewWrapper}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className={styles.imagePreview}
                  />
                  <button
                    className={styles.removeImage}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
              {uploadedImages.length < 2 && (
                <div
                  className={styles.addMoreImage}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  +
                </div>
              )}
            </div>
          )}
        </div>

        {/* Style Selection */}
        <div className={styles.styleSection}>
          {stylesList.map((style) => (
            <button
              key={style}
              className={`${styles.styleButton} ${
                selectedStyle === style ? styles.styleButtonActive : ""
              }`}
              onClick={() => setSelectedStyle(style)}
              type="button"
            >
              {style}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          className={styles.generateButton}
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          type="button"
        >
          {isLoading ? (
            "Generating..."
          ) : (
            <>
              <span>🎨</span> Generate Tattoo Designs
            </>
          )}
        </button>

        {/* Results Display */}
        {generatedImage && (
          <div className={styles.resultsSection}>
            <h2 className={styles.resultsTitle}>Generated Design</h2>
            <div className={styles.resultImageWrapper}>
              <img
                src={generatedImage}
                alt="Generated tattoo design"
                className={styles.resultImage}
              />
            </div>
            <div className={styles.resultActions}>
              <button
                className={styles.downloadButton}
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = generatedImage;
                  link.download = "tattoo-design.png";
                  link.click();
                }}
                type="button"
              >
                Download
              </button>
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
