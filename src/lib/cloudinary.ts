/**
 * Cloudinary Secure Upload Utility
 */

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  duration?: number;
}

export async function uploadToCloudinary(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  // 1. Get signature from backend
  const signResponse = await fetch("/api/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      params: {
        // Only include parameters that will be sent in the POST body to Cloudinary
        // resource_type is in the URL, not the body, so it should NOT be signed
      } 
    })
  });

  if (!signResponse.ok) throw new Error("Failed to get upload signature");
  const { signature, timestamp, apiKey, cloudName, uploadPreset } = await signResponse.json();

  // 2. Prepare upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", "ind-distribution");
  if (uploadPreset) {
    formData.append("upload_preset", uploadPreset);
  }

  // 3. Perform upload
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${file.type.startsWith("image/") ? "image" : "video"}/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response: CloudinaryResponse = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        const error = JSON.parse(xhr.responseText);
        reject(new Error(error.error?.message || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}
