export async function generateTattooDesign(image: string, style: string, prompt?: string) {
  const BANANA_API_URL = process.env.BANANA_API_URL;
  const BANANA_API_KEY = process.env.BANANA_API_KEY;
  // 如果使用具体的模型 slug，也可以在这里定义，或者通过 URL 包含
  // const MODEL_SLUG = "nano-banana-pro2"; 

  if (!BANANA_API_URL || !BANANA_API_KEY) {
    console.warn("Banana API credentials not found, using mock response");
    return mockGeneration();
  }

  // 构建适应 Tattoo 场景的 Prompt
  const stylePrompts: Record<string, string> = {
    "line-art": "clean line art tattoo design, minimal, black and white, vector style, white background",
    "dotwork": "dotwork tattoo style, stippling, detailed, black ink, white background",
    "watercolor": "watercolor tattoo style, vibrant colors, artistic splashes, white background",
    "old-school": "american traditional tattoo style, bold lines, limited color palette, vintage, white background",
    "minimalist": "minimalist tattoo, fine lines, simple, elegant, white background"
  };

  const basePrompt = stylePrompts[style] || "tattoo design, white background";
  const finalPrompt = `${basePrompt}, ${prompt || "artistic interpretation"}, high quality, sharp focus, 8k`;

  try {
    // 注意：这里的 payload 结构适配 Banana.dev 常见的 Serverless GPU 接口
    // Nano Banana Pro2 具体需要的参数可能略有不同，请参考该模型的具体文档
    const response = await fetch(BANANA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${BANANA_API_KEY}`,
      },
      body: JSON.stringify({
        // modelInputs 是 Banana 的标准输入字段
        modelInputs: {
          prompt: finalPrompt,
          negative_prompt: "skin, body parts, blurry, low quality, distorted, text, watermark, human, photo realistic",
          image: image, // 如果模型支持 img2img，传入 base64
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 512,
          height: 512,
          // 针对 Nano Banana Pro2 可能需要的特殊参数
          scheduler: "DPMSolverMultistep", 
        },
        callInputs: {
           // Banana 平台特定的调用参数
           MODEL_NAME: "nano-banana-pro2" 
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Generation failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    // 处理 Banana 异步/同步返回结果
    // 如果是异步任务，可能需要轮询，这里假设是同步返回或直接返回结果
    let generatedImage = result.modelOutputs?.[0]?.image_base64 || result.output?.image || result.image;

    if (!generatedImage) {
       console.error("Unexpected API response format:", result);
       throw new Error("No image data received from AI service");
    }

    // 确保返回的是 Data URL
    if (!generatedImage.startsWith("data:image")) {
        generatedImage = `data:image/png;base64,${generatedImage}`;
    }

    return {
        design: generatedImage,
        // 暂时复用设计图作为试穿图，后续可添加专门的合成逻辑
        tryOn: generatedImage 
    };

  } catch (error) {
    console.error("Error calling AI service:", error);
    // 在开发阶段，如果出错可以回退到 Mock，或者直接抛出错误给前端提示
    // throw error; 
    return mockGeneration();
  }
}

async function mockGeneration() {
  console.log("Generating mock tattoo design...");
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 返回一些占位图用于测试 UI
  return {
    design: "https://cdn.shopify.com/s/files/1/0663/5893/files/tattoo-mock-design.png?v=1", 
    tryOn: "https://cdn.shopify.com/s/files/1/0663/5893/files/tattoo-mock-tryon.png?v=1" 
  };
}
