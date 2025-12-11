import { useState, useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";
import { PromptInput } from "../PromptInput";
import { TattooStyle } from "../../types";
import { stylesList, surprisePrompts } from "../../constants";
import { XIcon } from "@shopify/polaris-icons";

interface ChatInterfaceProps {
  onGenerate: (prompt: string, style: TattooStyle) => void;
  isLoading: boolean;
  generatedImages: string[];
  onDownload: (url: string) => void;
  onImageClick: (url: string) => void;
  onUploadClick?: () => void;
  uploadedImage?: File | null;
  onRemoveImage?: () => void;
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "style_selection" | "image_result";
  images?: string[];
};

export function ChatInterface({
  onGenerate,
  isLoading,
  generatedImages,
  onDownload,
  onImageClick,
  onUploadClick,
  uploadedImage,
  onRemoveImage
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI Tattoo Artist. Describe your tattoo idea, and I'll help you design it. What do you have in mind?",
      type: "text"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<TattooStyle | null>(null);
  const [step, setStep] = useState<"prompt" | "style" | "generate">("prompt");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle generated images
  useEffect(() => {
    if (generatedImages.length > 0) {
      addMessage({
        role: "assistant",
        content: "Here are some designs I created for you!",
        type: "image_result",
        images: generatedImages
      });
      setStep("generate"); // Stay in generate mode for refinements
    }
  }, [generatedImages]);

  const addMessage = (msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now().toString() }]);
  };

  const handleSend = () => {
    if (!inputValue.trim() && !uploadedImage) return;

    const userText = inputValue.trim();
    setInputValue("");

    // If there is an uploaded image, we might want to mention it
    let content = userText;
    if (uploadedImage && !userText) content = "Uploaded an image for reference.";

    addMessage({ role: "user", content });

    if (step === "prompt") {
      setCurrentPrompt(userText);
      setStep("style");
      setTimeout(() => {
        addMessage({
          role: "assistant",
          content: "Great idea! Now, choose a style for your tattoo:",
          type: "style_selection"
        });
      }, 600);
    } else if (step === "generate") {
      // Refinement
      const newPrompt = currentPrompt ? `${currentPrompt}. ${userText}` : userText;
      setCurrentPrompt(newPrompt);

      setTimeout(() => {
        addMessage({
          role: "assistant",
          content: `Updating the design with your feedback...`,
          type: "text"
        });
        onGenerate(newPrompt, selectedStyle || "No Style");
      }, 600);
    }
  };

  const handleStyleSelect = (style: TattooStyle | "No Style") => {
    const validStyle = style === "No Style" ? "No Style" : style as TattooStyle;
    setSelectedStyle(validStyle === "No Style" ? null : validStyle);

    addMessage({ role: "user", content: `I'll go with ${style} style.` });
    setStep("generate");

    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: `Perfect! Creating a ${style} tattoo based on: "${currentPrompt}". This might take a moment...`,
        type: "text"
      });
      onGenerate(currentPrompt, validStyle as TattooStyle);
    }, 600);
  };

  const handleSurpriseMe = () => {
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setInputValue(randomPrompt);
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent, action?: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action?.();
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-full mx-auto bg-gray-50 rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Chat Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        role="log"
        aria-label="Chat history"
        tabIndex={0}
      >
        {messages.map((msg) => (
          <div key={msg.id}>
            <ChatBubble
              role={msg.role}
              content={msg.content}
              images={msg.images}
              onDownload={onDownload}
              onImageClick={onImageClick}
            />

            {msg.type === "style_selection" && !selectedStyle && step === "style" && (
              <div className="pl-11 grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 mb-4">
                {stylesList.slice(0, 6).map((style: TattooStyle) => (
                  <button
                    key={style}
                    onClick={() => handleStyleSelect(style)}
                    onKeyDown={(e) => handleButtonKeyDown(e, () => handleStyleSelect(style))}
                    className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                    aria-label={`Select ${style} style`}
                    tabIndex={0}
                  >
                    {style}
                  </button>
                ))}
                <button
                  onClick={() => handleStyleSelect("No Style")}
                  onKeyDown={(e) => handleButtonKeyDown(e, () => handleStyleSelect("No Style"))}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left text-gray-500 italic"
                  aria-label="Select random style"
                  tabIndex={0}
                >
                  Surprise Me (Any Style)
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start mb-4">
            <div className="flex max-w-[80%] flex-row gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce mx-0.5" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <PromptInput
        prompt={inputValue}
        setPrompt={setInputValue}
        handleSend={handleSend}
        onSurpriseMe={handleSurpriseMe}
        disabled={isLoading || (step === "style" && !selectedStyle)}
        onUploadClick={step === "prompt" ? onUploadClick : undefined}
        placeholder={
          step === "style"
            ? "Select a style above..."
            : step === "generate"
              ? "Describe changes or adjustments..."
              : "Describe your dream tattoo..."
        }
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
