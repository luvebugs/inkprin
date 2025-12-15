import { useState, useEffect, useRef } from "react";
import { ChatBubble } from "./MessageBubble";
import { PromptInput } from "./PromptInput";
import { TattooStyle, TattooColor, OutputFormat, AspectRatio } from "../../types";
import { stylesList, surprisePrompts } from "../../constants";
import { ChevronDownIcon, ChevronUpIcon, MagicIcon, PersonIcon } from "@shopify/polaris-icons";
import styles from '../../styles.module.css';
import { StyleSelector } from "./StyleSelector";
import { ActionButtons } from "./ActionButtons";



interface ChatInterfaceProps {
  onGenerate: (prompt: string, style: TattooStyle, color: TattooColor, format: OutputFormat, ratio: AspectRatio) => void;
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
  const [selectedColor, setSelectedColor] = useState<TattooColor>("Black & White");
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>("White paper");
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>("1:1 Square");
  
  const [step, setStep] = useState<"prompt" | "style" | "generate">("prompt");
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isExpanded]);

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
      setIsExpanded(true); // Auto-expand when results arrive
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

    // Auto-expand on user interaction if needed, or keep collapsed to show latest?
    // User requirement: "collapsed state only shows one latest message".
    // If user sends a message, that becomes the latest.

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
        onGenerate(newPrompt, selectedStyle || "No Style", selectedColor, selectedFormat, selectedRatio);
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
      onGenerate(currentPrompt, validStyle as TattooStyle, selectedColor, selectedFormat, selectedRatio);
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

  const displayedMessages = isExpanded ? messages : messages.slice(-1);
  const hasHistory = messages.length > 1;

  return (
    <div className={`relative flex flex-col w-full mx-auto transition-all duration-300 ${isExpanded ? 'bg-gray-50 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200' : 'h-auto bg-transparent'}`}>

      {hasHistory && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`absolute top-2 right-3 z-10 p-1.5 rounded-full shadow-sm transition-colors backdrop-blur-sm ${isExpanded ? 'bg-white/80 hover:bg-white text-gray-500 hover:text-indigo-600' : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-200'}`}
          title={isExpanded ? "Collapse chat" : "Show full history"}
          aria-label={isExpanded ? "Collapse chat" : "Show full history"}
        >
          {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </button>
      )}

      {/* Chat Messages Area */}
      <div
        className={`flex-1 ${isExpanded ? 'pt-4 pb-4 space-y-4' : 'p-0 mb-4 overflow-visible'}`}
        role="log"
        aria-label="Chat history"
        tabIndex={0}
      >
        {!isExpanded ? (
          // Collapsed View: Popup Bubble Style
          displayedMessages.map((msg) => (
            <div key={msg.id} className="relative bg-white rounded-xl p-3 shadow-lg border border-gray-200 mx-1">
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {msg.role === 'user' ? <PersonIcon className="w-4 h-4" /> : <MagicIcon className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-gray-900 mb-1">
                    {msg.role === 'user' ? 'You' : 'AI Tattoo Artist'}
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.images && msg.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-6 gap-2">
                      {msg.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={img} alt="Generated tattoo" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrow pointing down */}
              <div className={`${styles.arrow} left-1/6`}>
                  <span></span>
              </div>
            </div>
          ))
        ) : (
          // Expanded View: Standard Chat List
          <div className="h-[280px] pl-4 pr-4 custom-scrollbar overflow-auto">
            {displayedMessages.map((msg) => (
              <div key={msg.id}>
                <ChatBubble
                  role={msg.role}
                  content={msg.content}
                  images={msg.images}
                  onDownload={onDownload}
                  onImageClick={onImageClick}
                />
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
        )}
      </div>

      {/* Input Area */}
      <div className={`${styles.panel} rounded-xl sm:rounded-2xl transition-all duration-200`}>
        <div className={`${styles.inner} rounded-xl sm:rounded-2xl`}>
          <div className="rounded-xl sm:rounded-2xl rounded-b-4xl sm:rounded-b-2xl   p-0 sm:p-2 border border-gray-100 shadow-sm bg-white">
            <PromptInput
              prompt={inputValue}
              setPrompt={setInputValue}
              uploadedImage={uploadedImage}
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
            {/* {!selectedStyle || step === "style" && ( */}
              <StyleSelector
                selectedStyle={selectedStyle || "No Style"}
                setSelectedStyle={(style: TattooStyle) => handleStyleSelect(style)}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedFormat={selectedFormat}
                setSelectedFormat={setSelectedFormat}
                selectedRatio={selectedRatio}
                setSelectedRatio={setSelectedRatio}
              />
            {/* )} */}
            <ActionButtons
              handleGenerate={handleSend}
              isLoading={isLoading}
              prompt={inputValue}
              onUploadClick={onUploadClick || (() => { })}
            />
          </div>
        </div>
      </div>

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
    </div >
  );
}
