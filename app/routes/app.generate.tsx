import { useState, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  DropZone,
  Thumbnail,
  Button,
  Select,
  Text,
  InlineStack,
  Spinner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { Form, useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { json, unstable_parseMultipartFormData, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, writeAsyncIterableToWritable } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: { request: Request }) => {
  const { session } = await authenticate.admin(request);
  
  // Handle file upload
  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get("image");
  const style = formData.get("style");

  if (!file || typeof file === "string") {
    return json({ error: "No file uploaded" });
  }

  // In a real app, we would upload this file to S3/R2 here.
  // For this demo, we'll convert it to base64 to pass to our AI service (mocked).
  
  // Mocking the AI generation process
  await new Promise(resolve => setTimeout(resolve, 2000));

  return json({ 
    success: true, 
    imageUrl: "https://via.placeholder.com/300?text=Original", // Mock
    generatedUrl: "https://via.placeholder.com/300?text=Tattoo+Design", // Mock
    tryOnUrl: "https://via.placeholder.com/300?text=Try+On" // Mock
  });
};

export default function Generate() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("line-art");
  const submit = useSubmit();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
  const isSubmitting = navigation.state === "submitting";

  const handleDrop = useCallback(
    (_droppedFiles: File[], acceptedFiles: File[]) => {
      setFile(acceptedFiles[0]);
    },
    [],
  );

  const handleGenerate = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    formData.append("style", selectedStyle);
    submit(formData, { method: "post", encType: "multipart/form-data" });
  };

  const styleOptions = [
    { label: "Line Art", value: "line-art" },
    { label: "Dotwork", value: "dotwork" },
    { label: "Watercolor", value: "watercolor" },
    { label: "Old School", value: "old-school" },
    { label: "Minimalist", value: "minimalist" },
  ];

  return (
    <Page>
      <TitleBar title="Generate Tattoo" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">Upload Image</Text>
                <DropZone onDrop={handleDrop} allowMultiple={false}>
                  {file ? (
                    <BlockStack gap="200">
                      <Thumbnail
                        source={window.URL.createObjectURL(file)}
                        alt="Uploaded Image"
                      />
                      <Text as="span" variant="bodySm">{file.name}</Text>
                    </BlockStack>
                  ) : (
                    <DropZone.FileUpload />
                  )}
                </DropZone>

                <Select
                  label="Select Style"
                  options={styleOptions}
                  onChange={setSelectedStyle}
                  value={selectedStyle}
                />

                <Button 
                  variant="primary" 
                  onClick={handleGenerate} 
                  disabled={!file || isSubmitting}
                >
                  {isSubmitting ? <Spinner size="small" /> : "Generate Design"}
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          {actionData?.success && (
            <Layout.Section>
              <Card>
                <BlockStack gap="500">
                  <Text as="h2" variant="headingMd">Results</Text>
                  <InlineStack gap="400">
                    <BlockStack gap="200">
                       <Text as="h3" variant="headingSm">Design</Text>
                       <img src={actionData.generatedUrl} alt="Generated Design" style={{width: '100%', maxWidth: '300px'}} />
                    </BlockStack>
                    <BlockStack gap="200">
                       <Text as="h3" variant="headingSm">Virtual Try-On</Text>
                       <img src={actionData.tryOnUrl} alt="Try On" style={{width: '100%', maxWidth: '300px'}} />
                    </BlockStack>
                  </InlineStack>
                </BlockStack>
              </Card>
            </Layout.Section>
          )}
        </Layout>
      </BlockStack>
    </Page>
  );
}
