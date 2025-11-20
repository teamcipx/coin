const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

export const uploadToImgbb = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  if (!IMGBB_API_KEY) {
    throw new Error("ImgBB API Key missing in environment variables!");
  }

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url; // ইমেজের লিংক ফেরত দিচ্ছে
    } else {
      console.error("ImgBB Error:", data);
      throw new Error(data.error?.message || 'Image upload failed');
    }
  } catch (error) {
    console.error("ImgBB Upload Error:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
};
