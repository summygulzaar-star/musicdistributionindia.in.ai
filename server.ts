import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary Configuration (Lazy init to prevent crash on missing keys)
function setupCloudinary() {
  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.VITE_CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    console.log("✅ Cloudinary Configured");
    return true;
  }
  return false;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  setupCloudinary();

  // JSON Body Parser
  app.use(express.json());

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Example API route for generating ISRC (Mock logic for premium feel)
  app.post("/api/generate-isrc", (req, res) => {
    const isrc = "IN-D" + Math.random().toString(36).substring(2, 10).toUpperCase();
    res.json({ isrc });
  });

  // Cloudinary Signing Endpoint
  app.post("/api/cloudinary-sign", (req, res) => {
    try {
      const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, VITE_CLOUDINARY_CLOUD_NAME } = process.env;
      
      if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !VITE_CLOUDINARY_CLOUD_NAME) {
        console.error("❌ Cloudinary Config Missing:", { 
          hasKey: !!CLOUDINARY_API_KEY, 
          hasSecret: !!CLOUDINARY_API_SECRET, 
          cloudName: VITE_CLOUDINARY_CLOUD_NAME 
        });
        return res.status(500).json({ 
          error: "Cloudinary is not fully configured on the server. Please check your environment variables." 
        });
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const params = {
        folder: "ind-distribution",
        timestamp: timestamp,
        ...(process.env.VITE_CLOUDINARY_UPLOAD_PRESET ? { upload_preset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET } : {}),
        ...req.body.params
      };

      console.log("📝 Generating Signature for params:", params);

      const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.CLOUDINARY_API_SECRET!.trim()
      );

      res.json({
        signature,
        timestamp,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET
      });
    } catch (error) {
      console.error("Cloudinary signing error:", error);
      res.status(500).json({ error: "Failed to generate signature" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 IND Distribution Server Running\n🔗 http://localhost:${PORT}\n`);
  });
}

startServer();
