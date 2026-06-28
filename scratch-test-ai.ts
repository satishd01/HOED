import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import fs from "fs";
import path from "path";

// Read the .env.local file directly and set the env var manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
  if (match && match[1]) {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = match[1].trim();
  }
}

async function testGemini() {
  console.log("Checking API key format...");
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    console.error("No API key found in .env.local!");
    process.exit(1);
  }
  
  console.log("Key found. Testing connection to Gemini 2.0 Flash...");
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: "Say hello and confirm that you are online.",
    });
    console.log("\n--- AI Response ---");
    console.log(text);
    console.log("-------------------");
    console.log("\n✅ AI is working perfectly!");
  } catch (error) {
    console.error("\n❌ AI Test Failed:");
    console.error(error);
  }
}

testGemini();
