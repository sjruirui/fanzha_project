const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || 'file';
    const typeDir = path.join(uploadDir, type);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const type = req.params.type || 'file';

  if (type === 'image') {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('只支持 JPG、PNG、GIF、WEBP 格式的图片'), false);
    }
  } else if (type === 'video') {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('只支持 MP4、WEBM、OGG 格式的视频'), false);
    }
  }

  cb(null, true);
};

// Configure upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
});

/**
 * @route   POST /api/upload/:type
 * @desc    Upload file (image/video/file)
 * @access  Public
 */
router.post('/:type', (req, res, next) => {
  const type = req.params.type;
  if (!['image', 'video', 'file'].includes(type)) {
    return res.status(400).json({ code: 400, message: '无效的上传类型', data: null });
  }

  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ code: 400, message: '文件大小超出限制', data: null });
      }
      return res.status(400).json({ code: 400, message: err.message, data: null });
    }

    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择文件', data: null });
    }

    const url = `/uploads/${type}/${req.file.filename}`;

    res.json({
      code: 200,
      message: '上传成功',
      data: { url }
    });
  });
});

module.exports = router;