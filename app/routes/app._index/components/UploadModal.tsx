import React from 'react';
import { Modal, DropZone, LegacyStack, Thumbnail, Text } from "@shopify/polaris";
import { NoteIcon } from "@shopify/polaris-icons";

interface UploadModalProps {
  showDesignChoicesModal: boolean;
  setShowDesignChoicesModal: (value: boolean) => void;
  uploadedImage: File | null;
  handleDropZoneDrop: (_dropFiles: File[], acceptedFiles: File[], _rejectedFiles: File[]) => void;
  setUploadedImage: (file: File | null) => void;
}

export function UploadModal({
  showDesignChoicesModal,
  setShowDesignChoicesModal,
  uploadedImage,
  handleDropZoneDrop,
  setUploadedImage
}: UploadModalProps) {
  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

  const fileUpload = !uploadedImage && <DropZone.FileUpload />;
  const uploadedFile = uploadedImage && (
    <LegacyStack>
      <Thumbnail
        size="small"
        alt={uploadedImage.name}
        source={
          validImageTypes.includes(uploadedImage.type)
            ? window.URL.createObjectURL(uploadedImage)
            : NoteIcon
        }
      />
      <div>
        {uploadedImage.name} <Text variant="bodySm" as="p">{uploadedImage.size} bytes</Text>
      </div>
    </LegacyStack>
  );

  return (
    <Modal
      open={showDesignChoicesModal}
      onClose={() => setShowDesignChoicesModal(false)}
      title="Upload Reference Image"
      primaryAction={{
        content: 'Confirm',
        onAction: () => setShowDesignChoicesModal(false),
      }}
      secondaryActions={[
        {
          content: 'Clear',
          onAction: () => setUploadedImage(null),
        },
      ]}
    >
      <Modal.Section>
        <DropZone onDrop={handleDropZoneDrop}>
          {uploadedFile}
          {fileUpload}
        </DropZone>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Upload an image to use as a reference for the style or composition.
          </p>
        </div>
      </Modal.Section>
    </Modal>
  );
}
