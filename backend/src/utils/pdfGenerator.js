/**
 * PDF Generator using Puppeteer.
 * Converts HTML content to a PDF buffer suitable for A4 printing.
 */
import puppeteer from 'puppeteer';

/**
 * Generate a PDF buffer from HTML content.
 * @param {string} htmlContent - Full HTML document string
 * @returns {Promise<Buffer>} PDF as a Node.js Buffer
 */
export async function generatePdf(htmlContent) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    headless: 'new',
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:9px;width:100%;text-align:right;padding-right:15mm;color:#888">
        Page <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>`,
      footerTemplate: '<div></div>',
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
