import { Avatar, Text } from "@shopify/polaris";
import { MagicIcon, PersonIcon } from "@shopify/polaris-icons";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: React.ReactNode;
  images?: string[];
  onDownload?: (url: string) => void;
  onImageClick?: (url: string) => void;
}

export function ChatBubble({ role, content, images, onDownload, onImageClick }: ChatBubbleProps) {
  const isUser = role === "user";

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"} gap-3`}>
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>
            {isUser ? <PersonIcon className="w-5 h-5" /> : <MagicIcon className="w-5 h-5" />}
          </div>
        </div>
        
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div className={`p-3 rounded-2xl ${isUser ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"}`}>
            <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
              {content}
            </div>
          </div>

          {images && images.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 w-full max-w-md">
              {images.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`View generated tattoo ${index + 1}`}
                    className="w-full h-full cursor-pointer"
                    onClick={() => onImageClick?.(img)}
                    onKeyDown={(e) => onImageClick && handleKeyDown(e, () => onImageClick(img))}
                  >
                    <img 
                      src={img} 
                      alt={`Generated tattoo ${index + 1}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {onDownload && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(img);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        handleKeyDown(e, () => onDownload(img));
                      }}
                      className="absolute bottom-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Download"
                      aria-label={`Download generated tattoo ${index + 1}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
