# InkGen AI - Shopify Tattoo Generator

This is a Shopify App that allows users to generate tattoo designs using AI.

## Features

- Upload images for inspiration
- Choose from various tattoo styles (Line Art, Dotwork, etc.)
- Generate unique tattoo designs using AI (Integration with Nano Banana Pro2)
- Virtual Try-On (Mockup)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup Database:
   ```bash
   npx prisma migrate dev --name init
   ```

3. Configure Environment:
   Copy `.env.example` to `.env` and fill in your Shopify and Banana.dev credentials.

   ```bash
   cp .env.example .env
   ```

4. Run the App:
   ```bash
   npm run dev
   ```

## AI Configuration

This app is configured to use a model hosted on Banana.dev (Nano Banana Pro2). 
Update `app/services/ai.server.ts` with the specific model payload requirements if they differ from the default.
