import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmnfb7wss',
  api_key: process.env.CLOUDINARY_API_KEY || '182942126213814',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ZTrVVxvDi7xT5cWrlB6MIefUf0c',
});

export default cloudinary;
