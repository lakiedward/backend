import multer from 'multer';

// Configurare multer pentru stocare în memorie (convertim la base64)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Acceptă doar imagini
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Max 5MB
  }
});

// POST upload single image - returnează base64
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convertește buffer-ul la base64
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    res.json({
      message: 'Image uploaded successfully',
      image: {
        url: dataUrl,
        originalName: req.file.originalname,
        mimeType: mimeType,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// POST upload multiple images - returnează array de base64
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const images = req.files.map(file => {
      const base64 = file.buffer.toString('base64');
      const mimeType = file.mimetype;
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return {
        url: dataUrl,
        originalName: file.originalname,
        mimeType: mimeType,
        size: file.size
      };
    });

    res.json({
      message: `${images.length} images uploaded successfully`,
      images: images
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
};

// Error handler pentru multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
