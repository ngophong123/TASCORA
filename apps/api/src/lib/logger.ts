import pino, { type DestinationStream, type LoggerOptions } from 'pino';

export const LOGGER_REDACT_PATHS = [
  'password',
  '*.password',
  'newPassword',
  '*.newPassword',
  'token',
  '*.token',
  'resetToken',
  '*.resetToken',
  'refreshToken',
  '*.refreshToken',
  'accessToken',
  '*.accessToken',
  'documentNumber',
  '*.documentNumber',
  'documentNumberEncrypted',
  '*.documentNumberEncrypted',
  'dateOfBirth',
  '*.dateOfBirth',
  'dateOfBirthEncrypted',
  '*.dateOfBirthEncrypted',
  'kycEncryptionKey',
  '*.kycEncryptionKey',
  'authorization',
  '*.authorization',
  'cookie',
  '*.cookie',
  'setCookie',
  '*.setCookie',
  'headers.authorization',
  'headers.cookie',
  'headers["set-cookie"]',
  '*.headers["set-cookie"]',
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'body.password',
  'body.newPassword',
  'body.token',
  'body.resetToken',
  'body.documentNumber',
  'body.dateOfBirth',
];

export function createLoggerOptions(): LoggerOptions {
  return {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    redact: {
      paths: LOGGER_REDACT_PATHS,
      censor: '[REDACTED]',
    },
  };
}

export function createAppLogger(destination?: DestinationStream) {
  return destination ? pino(createLoggerOptions(), destination) : pino(createLoggerOptions());
}

export const logger = createAppLogger();
