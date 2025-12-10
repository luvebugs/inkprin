import React from 'react';
import { Modal } from "@shopify/polaris";
import DownloadIcon from "../../../assets/icons/download.svg?react";

interface ImagePreviewModalProps {
  previewImage: string | null;
  setPreviewImage: (image: string | null) => void;
  handleDownload: (imageUrl: string) => void;
}

export function ImagePreviewModal({ previewImage, setPreviewImage, handleDownload }: ImagePreviewModalProps) {
  if (!previewImage) return null;

  return (
    <Modal
      open={!!previewImage}
      onClose={() => setPreviewImage(null)}
      title="Preview"
      size="large"
    >
      <Modal.Section>
        <div className="flex flex-col items-center gap-4">
          <img
            src={previewImage}
            alt="Full size preview"
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
          <div className="flex justify-end w-full">
            <button
              onClick={() => handleDownload(previewImage)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              type="button"
            >
              <DownloadIcon width="20" height="20" className="text-white" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </Modal.Section>
    </Modal>
  );
}
