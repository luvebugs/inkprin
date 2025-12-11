import { useState, useCallback, useEffect } from "react";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Page, Layout, Card, BlockStack } from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { saveImageToDB, getAllImagesFromDB } from "../../utils/indexedDB";

// Components
import { Header } from "./components/Header";
import { PromptInput } from "./components/PromptInput";
import { StyleSelector } from "./components/StyleSelector";
import { ActionButtons } from "./components/ActionButtons";
import { ResultGrid } from "./components/ResultGrid";
import { ImagePreviewModal } from "./components/ImagePreviewModal";
import { UploadModal } from "./components/UploadModal";

// Types and Constants
import { TattooStyle } from "./types";
import { surprisePrompts } from "./constants";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const prompt = formData.get("prompt");
  const style = formData.get("style");

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // In a real app, you would call an image generation API here
  // returning mock images for now
  return {
    status: "success",
    images: [
      "https://images.unsplash.com/photo-1590246814883-05add5d833a6?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=600&auto=format&fit=crop"
    ]
  };
};

export default function TattooGenerator() {
  const { apiKey } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading = navigation.state === "submitting";

  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<TattooStyle>("No Style");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showDesignChoicesModal, setShowDesignChoicesModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load saved images from IndexedDB on mount
  useEffect(() => {
    getAllImagesFromDB().then((images) => {
      if (images && images.length > 0) {
        setGeneratedImages(images.map((img) => img.url));
      }
    });
  }, []);

  // Watch for action data to update generated images
  useEffect(() => {
    if (actionData?.status === "success" && actionData.images) {
      setGeneratedImages(actionData.images);
      
      // Save to IndexedDB
      actionData.images.forEach((url: string) => {
        saveImageToDB(url, prompt, selectedStyle);
      });
    }
  }, [actionData, prompt, selectedStyle]);

  const handleGenerate = async () => {
    if (!prompt) return;

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("style", selectedStyle);

    submit(formData, { method: "post" });
  };

  const handleSurpriseMe = () => {
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setPrompt(randomPrompt);
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
                <div className="lg:col-span-4 space-y-6">
                  <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    handleSurpriseMe={handleSurpriseMe}
                    uploadedImage={uploadedImage}
                    handleRemoveImage={handleRemoveImage}
                    setShowDesignChoicesModal={setShowDesignChoicesModal}
                  />

                  <StyleSelector
                    selectedStyle={selectedStyle}
                    setSelectedStyle={setSelectedStyle}
                  />

                  <ActionButtons
                    handleGenerate={handleGenerate}
                    isLoading={isLoading}
                    prompt={prompt}
                    setShowDesignChoicesModal={setShowDesignChoicesModal}
                  />
                </div>

                {/* Right Column - Results */}
                <div className="lg:col-span-8">
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
