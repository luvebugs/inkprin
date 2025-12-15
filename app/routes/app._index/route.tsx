import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Page, Layout, Card, BlockStack } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { saveImageToDB, getAllImagesFromDB } from "../../utils/indexedDB";
import styles from './styles.module.css'

// Components
import { Header } from "./components/Header";

import { ResultGrid } from "./components/ResultGrid";
import { ImagePreviewModal } from "./components/ImagePreviewModal";
import { UploadModal } from "./components/UploadModal";

import { ChatInterface } from "./components/Chat/ChatPanel";

// Types and Constants
import { TattooStyle, TattooColor, OutputFormat, AspectRatio } from "./types";
import { surprisePrompts } from "./constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const prompt = formData.get("prompt") as string;
  const style = formData.get("style") as string;
  const color = formData.get("color") as string;
  const format = formData.get("format") as string;
  const ratio = formData.get("ratio") as string;

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real app, you would call an image generation API here
  // returning mock images for now
  return {
    images: [
      "https://jattoo.com/cdn/shop/files/10002_b856667b-3da5-4614-9f62-87589773c11e.webp?v=1759074884&width=1000",
      "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=600&auto=format&fit=crop"
    ]
  };
};

export default function Index() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<TattooStyle>("No Style");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showDesignChoicesModal, setShowDesignChoicesModal] = useState(false);

  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isLoading = navigation.state === "submitting";

  // Load history from IndexedDB on mount
  useEffect(() => {
    getAllImagesFromDB().then((images) => {
      if (images.length > 0) {
        // setGeneratedImages(images.map(img => img.url));
      }
    });
  }, []);

  // Handle action data (newly generated images)
  useEffect(() => {
    if (actionData?.images) {
      setGeneratedImages(prev => [...actionData.images, ...prev]);

      // Save to IndexedDB
      actionData.images.forEach((url: string) => {
        saveImageToDB(url, prompt, selectedStyle);
      });
    }
  }, [actionData, prompt, selectedStyle]);

  const handleGenerate = async (
    promptText?: string,
    styleName?: TattooStyle,
    color?: TattooColor,
    format?: OutputFormat,
    ratio?: AspectRatio
  ) => {
    const textToUse = promptText || prompt;
    const styleToUse = styleName || selectedStyle;

    if (!textToUse) return;

    // Update state to ensure correct saving to DB
    setPrompt(textToUse);
    if (styleToUse) setSelectedStyle(styleToUse);

    const formData = new FormData();
    formData.append("prompt", textToUse);
    formData.append("style", styleToUse || "No Style");
    if (color) formData.append("color", color);
    if (format) formData.append("format", format);
    if (ratio) formData.append("ratio", ratio);

    submit(formData, { method: "post" });
  };

  const handleDropZoneDrop = useCallback(
    (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => {
      setUploadedImage(acceptedFiles[0]);
    },
    [],
  );

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tattoo-design-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
  };

  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Header />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - Inputs */}
                <div className="lg:col-span-5 space-y-6">
                  <ChatInterface
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                    generatedImages={generatedImages}
                    onDownload={handleDownload}
                    onImageClick={setPreviewImage}
                    onUploadClick={() => setShowDesignChoicesModal(true)}
                    uploadedImage={uploadedImage}
                    onRemoveImage={handleRemoveImage}
                  />
                </div>

                {/* Right Column - Results */}
                <div className="lg:col-span-7">
                  {generatedImages.length > 0 ? (
                    <ResultGrid
                      generatedImages={generatedImages}
                      setPreviewImage={setPreviewImage}
                      handleDownload={handleDownload}
                    />
                  ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 mb-4 opacity-20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p>Generated tattoo designs will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      <ImagePreviewModal
        previewImage={previewImage}
        setPreviewImage={setPreviewImage}
        handleDownload={handleDownload}
      />

      <UploadModal
        showDesignChoicesModal={showDesignChoicesModal}
        setShowDesignChoicesModal={setShowDesignChoicesModal}
        uploadedImage={uploadedImage}
        handleDropZoneDrop={handleDropZoneDrop}
        setUploadedImage={setUploadedImage}
      />
    </Page>
  );
}
