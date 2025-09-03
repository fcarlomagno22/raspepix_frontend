import { isProduction } from './utils';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  level?: LogLevel;
  sanitize?: boolean;
}

const sensitiveKeys = [
  'token',
  'password',
  'secret',
  'key',
  'auth',
  'url',
  'supabase',
  'api',
  'bearer',
  'jwt',
  'session'
];

function sanitizeData(data: any): any {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Verifica se a string contém alguma palavra sensível
    const containsSensitive = sensitiveKeys.some(key => 
      data.toLowerCase().includes(key.toLowerCase())
    );
    return containsSensitive ? '[REDACTED]' : data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object') {
    const sanitized = { ...data };
    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    }
    return sanitized;
  }
  
  return data;
}

export const logger = {
  debug: (message: string, data?: any, options: LogOptions = {}) => {
    if (isProduction()) return;
    const sanitizedData = options.sanitize ? sanitizeData(data) : data;
    console.log(`[DEBUG] ${message}`, sanitizedData || '');
  },
  
  info: (message: string, data?: any, options: LogOptions = {}) => {
    if (isProduction()) return;
    const sanitizedData = options.sanitize ? sanitizeData(data) : data;
    console.info(`[INFO] ${message}`, sanitizedData || '');
  },
  
  warn: (message: string, data?: any, options: LogOptions = {}) => {
    const sanitizedData = options.sanitize ? sanitizeData(data) : data;
    console.warn(`[WARN] ${message}`, sanitizedData || '');
  },
  
  error: (message: string, error?: any, options: LogOptions = {}) => {
    const sanitizedError = options.sanitize ? sanitizeData(error) : error;
    console.error(`[ERROR] ${message}`, sanitizedError || '');
  }
};
