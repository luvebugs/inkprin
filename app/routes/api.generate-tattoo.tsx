import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;
    const style = formData.get("style") as string;
    const images = formData.getAll("images") as File[];

    if (!prompt || prompt.trim().length === 0) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 读取网关配置（默认走你的网关域名）
    const apiKey = process.env.NANO_API_KEY || process.env.GEMINI_API_KEY || "sk-DcH56GrxD1uWnE6p44bPOuwzZfzVY9OoipViTDZIN6wrjq0D";
    const baseUrl = (process.env.NANO_API_URL || "https://nano.zhihuiapi.top").replace(/\/$/, "");
    const apiUrl = `${baseUrl}/v1beta/models/gemini-2.5-flash-image:generateContent`;

    if (!apiKey) {
      return Response.json(
        { error: "Nano Banana Pro API key not configured" },
        { status: 500 }
      );
    }

    // 组合提示词
    const enhancedPrompt = `${prompt}, ${style} tattoo style, high quality, detailed, professional tattoo design`;

    // 组装 Google Gemini Image API 请求体（通过你的网关转发）
    // 仅文本必须，其它上传图片作为参考放入 parts。
    const parts: any[] = [{ text: enhancedPrompt }];

    if (images && images.length > 0) {
      for (const file of images) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        parts.push({
          inline_data: {
            mime_type: file.type || "image/png",
            data: base64,
          },
        });
      }
    }

    const requestBody = {
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    };


    // 调用你的网关（Authorization: Bearer）
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Nano Banana Pro API error:", errorText);
      return Response.json(
        { error: "Failed to generate tattoo design", details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    // 解析返回的 inline_data（base64 图片）
    const partsResp = result?.candidates?.[0]?.content?.parts ?? [];
    let inline: any = null;
    for (const p of partsResp) {
      if (p?.inline_data || p?.inlineData) {
        inline = p.inline_data || p.inlineData;
        break;
      }
    }

    if (!inline?.data) {
      return Response.json(
        { error: "No image data in response", details: JSON.stringify(result) },
        { status: 500 }
      );
    }

    const mime = inline.mime_type || inline.mimeType || "image/png";
    const dataUri = `data:${mime};base64,${inline.data}`;

    // 返回可直接展示的 data URI
    return Response.json({
      success: true,
      imageUrl: undefined,
      imageData: dataUri,
      prompt: enhancedPrompt,
    });
  } catch (error) {
    console.error("Error generating tattoo:", error);
    return Response.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
