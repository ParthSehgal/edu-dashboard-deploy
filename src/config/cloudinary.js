const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    // Images/videos go as 'image', everything else as 'raw' so Cloudinary accepts it
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoTypes = ['mp4', 'mov', 'avi', 'mkv'];
    let resourceType = 'raw';
    if (imageTypes.includes(ext)) resourceType = 'image';
    else if (videoTypes.includes(ext)) resourceType = 'video';

    return {
      folder: 'edunexus_uploads',
      resource_type: resourceType,
      // Keep the original filename so it's identifiable in Cloudinary dashboard
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
    };
  }
});

module.exports = { cloudinary, storage };
