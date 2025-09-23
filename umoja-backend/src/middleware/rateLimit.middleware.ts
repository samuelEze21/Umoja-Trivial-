import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.maxRequests, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000), // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests
  skipSuccessfulRequests: false,
  // Skip failed requests
  skipFailedRequests: false,
});

// Authentication specific rate limiting (more restrictive)
export const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 auth attempts per hour
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many login attempts, please try again in an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Don't count successful auth requests against the limit
  skipSuccessfulRequests: true,
});

// SMS/OTP specific rate limiting
export const smsRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 SMS per minute per IP
  message: {
    success: false,
    error: 'SMS rate limit exceeded',
    message: 'Please wait before requesting another verification code.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Game API rate limiting (more lenient for gameplay)
export const gameRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for gameplay
  message: {
    success: false,
    error: 'Game rate limit exceeded',
    message: 'You are playing too fast, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin API rate limiting
export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for admin operations
  message: {
    success: false,
    error: 'Admin rate limit exceeded',
    message: 'Too many admin requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Coin transfer rate limiting
export const coinTransferRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 coin transfers per minute
  message: {
    success: false,
    error: 'Transfer rate limit exceeded',
    message: 'You can only make 5 coin transfers per minute.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});