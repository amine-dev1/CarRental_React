/**
 * Storage service for contract PDFs.
 * Supports local filesystem storage.
 * Can be extended to support S3 in the future.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads/contracts');

// Ensure the contracts upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Save a PDF buffer to local storage.
 * @param {Buffer} pdfBuffer - The PDF content
 * @param {string} filename - e.g. "CTR-2025-0042_v1.pdf"
 * @returns {{ filePath: string, fileUrl: string }} paths for DB storage
 */
export function savePdf(pdfBuffer, filename) {
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, pdfBuffer);

  // Public URL served by express.static("/uploads", ...)
  const fileUrl = `/uploads/contracts/${filename}`;

  return { filePath, fileUrl };
}

/**
 * Get the absolute file path for a contract PDF.
 * @param {string} relativePath - e.g. "/uploads/contracts/CTR-2025-0042_v1.pdf"
 * @returns {string} Absolute path on disk
 */
export function getAbsolutePath(relativePath) {
  // relativePath is like /uploads/contracts/filename.pdf
  const filename = path.basename(relativePath);
  return path.join(UPLOAD_DIR, filename);
}

/**
 * Check if a file exists on disk.
 * @param {string} absolutePath
 * @returns {boolean}
 */
export function fileExists(absolutePath) {
  return fs.existsSync(absolutePath);
}
