/**
 * Logger utility - Only logs in development mode
 * Replace console.log calls with logger.info/debug/error
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
};

