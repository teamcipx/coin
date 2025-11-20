// In a real Next.js app, this would be a server-side API route to hide the key.
// For this React SPA, we proxy or call directly with a warning.

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'DEMO_KEY_REPLACE_IN_ENV'; 

export const uploadToImgbb = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  // WARNING: Client-side call exposes API Key. Use a Proxy/Serverless function in Production.
  // Endpoint: https://api.imgbb.com/1/upload?key=YOUR_CLIENT_API_KEY
  
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Image upload failed');
    }
  } catch (error) {
    console.error("Imgbb Upload Error:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
};