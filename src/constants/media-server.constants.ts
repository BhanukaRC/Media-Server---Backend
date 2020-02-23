import multer from 'multer';

export const PORT = 9001;
export const MONGO_URL = "mongodb://localhost:27017/MediaServer";
export const FILE_TYPES = [ "Audio", "Image", "Video", "Other"];
export const SALT_LIMIT = 11;
export const PERMISSION_LEVEL = '0744';
export const ROOT_FOLDER = 'RootFolder';

