import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

/**
 * Generate Access Token JWT (umur pendek: 15 menit)
 * @param {object} payload
 * @returns {string}
 */
export function generateAccessToken(payload) {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
    },
    ENV.JWT.ACCESS_SECRET,
    {
      expiresIn: ENV.JWT.ACCESS_EXPIRES_IN,
    }
  );
}

/**
 * Generate Refresh Token JWT (umur panjang: 7 hari)
 * @param {object} payload
 * @returns {string}
 */
export function generateRefreshToken(payload) {
  return jwt.sign(
    {
      ...payload,
      jti: crypto.randomUUID(),
    },
    ENV.JWT.REFRESH_SECRET,
    {
      expiresIn: ENV.JWT.REFRESH_EXPIRES_IN,
    }
  );
}

/**
 * Verifikasi Access Token JWT
 * @param {string} token
 * @returns {object} decoded payload
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, ENV.JWT.ACCESS_SECRET);
}

/**
 * Verifikasi Refresh Token JWT
 * @param {string} token
 * @returns {object} decoded payload
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, ENV.JWT.REFRESH_SECRET);
}

/**
 * Hash refresh token menggunakan SHA-256 sebelum disimpan di database
 * @param {string} token
 * @returns {string}
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Hitung tanggal kedaluwarsa refresh token
 * @param {string} durationStr
 * @returns {Date}
 */
export function getRefreshTokenExpiryDate(durationStr = ENV.JWT.REFRESH_EXPIRES_IN) {
  const match = String(durationStr).match(/^(\d+)([smhd])$/);
  let ms = 7 * 24 * 60 * 60 * 1000; // default 7 hari
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === 's') ms = value * 1000;
    else if (unit === 'm') ms = value * 60 * 1000;
    else if (unit === 'h') ms = value * 60 * 60 * 1000;
    else if (unit === 'd') ms = value * 24 * 60 * 60 * 1000;
  }
  return new Date(Date.now() + ms);
}
