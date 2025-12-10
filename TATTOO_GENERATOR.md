# 纹身生成器组件说明

## 功能概述

已成功集成 Nano Banana Pro AI 引擎到 Shopify 商店，提供个性化纹身设计生成功能。

## 已实现功能

### ✅ 文字描述输入生成纹身
- 用户可以通过文字描述输入想要生成的纹身设计
- 支持最多 300 字符的描述
- 实时显示字符计数

### ✅ 图片上传参考生成纹身
- 支持上传最多 2 张参考图片
- 每张图片最大 5MB
- 支持拖拽上传
- 图片预览功能
- 可删除已上传的图片

### ✅ Nano Banana Pro AI引擎
- 集成 Nano Banana Pro Pro API
- 支持文字描述生成
- 支持参考图片生成
- 可配置的 API 密钥和 URL

### ✅ 基础结果展示
- 生成结果的图片展示
- 下载功能
- 加载状态提示
- 错误提示

## 文件结构

```
app/routes/
├── app._index.tsx              # 主页面组件（纹身生成器界面）
├── app._index.module.css       # 样式文件
└── api.generate-tattoo.tsx     # API 路由（处理生成请求）
```

## 配置说明

### 环境变量

需要在环境变量中配置以下内容：

```bash
NANO_BANANA_API_KEY=your_api_key_here
NANO_BANANA_API_URL=https://api.nano-bananapro.com/v1/generate  # 可选，默认值
```

### 本地开发

1. 在项目根目录创建 `.env` 文件（如果不存在）
2. 添加上述环境变量
3. 运行 `shopify app dev`

### 生产环境

在部署时，通过 Shopify CLI 或托管平台设置环境变量。

## 使用方法

1. 访问应用主页（`/app`）
2. 在文本框中输入纹身描述
3. （可选）上传参考图片
4. 选择纹身风格（Minimalist, Traditional, Watercolor, Geometric, Japanese）
5. 点击 "Generate Tattoo Designs" 按钮
6. 等待生成完成
7. 查看结果并下载

## API 路由

### POST /api/generate-tattoo

**请求格式：** `multipart/form-data`

**参数：**
- `prompt` (string, 必需): 纹身描述文字
- `style` (string, 必需): 纹身风格
- `images` (File[], 可选): 参考图片（最多 2 张）

**响应：**
```json
{
  "success": true,
  "imageUrl": "https://...",
  "imageData": "data:image/...",
  "prompt": "enhanced prompt"
}
```

## 界面设计

界面设计参考了提供的图片，包含：
- 品牌标题 "inkprin" 和副标题
- 文字输入区域（带字符计数）
- 图片上传区域（支持拖拽）
- 风格选择按钮（5 种风格）
- 生成按钮
- 结果展示区域

## 注意事项

1. 确保 Nano Banana Pro API 密钥已正确配置
2. API URL 可能需要根据实际服务调整
3. 图片上传限制：最多 2 张，每张 5MB
4. 文字描述限制：最多 300 字符

## 后续优化建议

1. 添加更多纹身风格选项
2. 支持批量生成多个设计
3. 添加设计历史记录
4. 集成到 Shopify 产品创建流程
5. 添加用户收藏功能
6. 支持设计编辑和调整



