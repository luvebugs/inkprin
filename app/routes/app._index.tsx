import { Page, Layout, Text, Card, BlockStack, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: { request: Request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function Index() {
  return (
    <Page>
      <TitleBar title="InkGen Dashboard" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  InkGen AI Tattoo Generator
                </Text>
                <Text as="p" variant="bodyMd">
                  If you can see this text, the App is loading correctly.
                </Text>
                
                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">Actions:</Text>
                  
                  {/* Method 1: Remix Link with Polaris Button */}
                  <Link to="/app/generate">
                    <Button variant="primary" size="large">Go to Generator (Remix Link)</Button>
                  </Link>

                  {/* Method 2: Polaris Button with url prop */}
                  <Button url="/app/generate">Go to Generator (Polaris URL)</Button>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
