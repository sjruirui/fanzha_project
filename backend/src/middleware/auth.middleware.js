const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Authentication middleware for users
 */
const authUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ code: 401, message: '请先登录', data: null });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ code: 401, message: 'Token无效或已过期', data: null });
    }

    if (decoded.type !== 'user') {
      return res.status(401).json({ code: 401, message: '请使用用户账号登录', data: null });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '认证失败', data: null });
  }
};

/**
 * Authentication middleware for admins
 */
const authAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ code: 401, message: '请先登录', data: null });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ code: 401, message: 'Token无效或已过期', data: null });
    }

    if (decoded.type !== 'admin') {
      return res.status(401).json({ code: 401, message: '请使用管理员账号登录', data: null });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ code: 401, message: '认证失败', data: null });
  }
};

/**
 * Optional authentication - doesn't require login but sets user if token exists
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

/**
 * Check if user is super admin
 */
const isSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 2) {
    return res.status(403).json({ code: 403, message: '需要超级管理员权限', data: null });
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authUser,
  authAdmin,
  optionalAuth,
  isSuperAdmin
};