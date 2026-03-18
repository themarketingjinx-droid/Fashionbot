import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_3D_EXTS = ['.glb', '.gltf', '.fbx', '.obj'];
const MAX_SIZE_MB = 250;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = Date.now() + '-' + Math.random().toString(36).slice(2);
    cb(null, safe + ext);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_3D_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type "${ext}". Allowed: ${ALLOWED_3D_EXTS.join(', ')}`));
  }
}

export const uploadModel = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
}).single('model');
