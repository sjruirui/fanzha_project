const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const chunksDir = path.join(uploadDir, 'chunks');
if (!fs.existsSync(chunksDir)) {
  fs.mkdirSync(chunksDir, { recursive: true });
}

const videoDir = path.join(uploadDir, 'video');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

const imageDir = path.join(uploadDir, 'image');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
});

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

// Chunk upload: use temp dir first, then move after body is parsed
const chunkUpload = multer({
  dest: chunksDir,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

router.post('/video/init', (req, res) => {
  const { fileHash, totalChunks, fileName, fileSize, fileExt } = req.body;

  if (!fileHash || !totalChunks) {
    return res.status(400).json({ code: 400, message: '缺少必要参数', data: null });
  }

  const chunkDir = path.join(chunksDir, fileHash);
  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir, { recursive: true });
  }

  res.json({
    code: 200,
    message: '初始化成功',
    data: { fileHash, totalChunks }
  });
});

router.post('/video/chunk', (req, res, next) => {
  chunkUpload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ code: 400, message: '分片大小超出限制', data: null });
      }
      return res.status(400).json({ code: 400, message: err.message, data: null });
    }

    const { fileHash, chunkIndex } = req.body;

    if (!req.file) {
      return res.status(400).json({ code: 400, message: '分片上传失败', data: null });
    }

    if (!fileHash || chunkIndex === undefined) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ code: 400, message: '缺少必要参数', data: null });
    }

    // Move temp file to the correct chunk directory
    const chunkDir = path.join(chunksDir, fileHash);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const targetPath = path.join(chunkDir, `chunk_${chunkIndex}`);
    fs.renameSync(req.file.path, targetPath);

    res.json({
      code: 200,
      message: '分片上传成功',
      data: { fileHash, chunkIndex }
    });
  });
});

router.post('/video/complete', (req, res) => {
  const { fileHash, totalChunks, fileName, fileExt } = req.body;

  if (!fileHash || !totalChunks) {
    return res.status(400).json({ code: 400, message: '缺少必要参数', data: null });
  }

  const chunkDir = path.join(chunksDir, fileHash);

  if (!fs.existsSync(chunkDir)) {
    return res.status(400).json({ code: 400, message: '分片目录不存在', data: null });
  }

  const ext = fileExt || '.mp4';
  const finalFileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
  const finalFilePath = path.join(videoDir, finalFileName);

  const writeStream = fs.createWriteStream(finalFilePath);

  for (let i = 0; i < parseInt(totalChunks); i++) {
    const chunkPath = path.join(chunkDir, `chunk_${i}`);
    if (!fs.existsSync(chunkPath)) {
      writeStream.close();
      fs.unlinkSync(finalFilePath);
      return res.status(400).json({ code: 400, message: `分片 ${i} 不存在`, data: null });
    }
    const chunkData = fs.readFileSync(chunkPath);
    writeStream.write(chunkData);
  }

  writeStream.close();

  fs.rmSync(chunkDir, { recursive: true, force: true });

  const url = `/uploads/video/${finalFileName}`;

  res.json({
    code: 200,
    message: '视频上传完成',
    data: { url, fileName: finalFileName }
  });
});

router.post('/video/cancel', (req, res) => {
  const { fileHash } = req.body;

  if (!fileHash) {
    return res.status(400).json({ code: 400, message: '缺少文件哈希', data: null });
  }

  const chunkDir = path.join(chunksDir, fileHash);

  if (fs.existsSync(chunkDir)) {
    fs.rmSync(chunkDir, { recursive: true, force: true });
  }

  res.json({
    code: 200,
    message: '已取消上传',
    data: null
  });
});

module.exports = router;