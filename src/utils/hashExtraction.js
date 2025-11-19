import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Configure PDF.js worker - use worker from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;

/**
 * Compute SHA-256 hash from data
 * @param {string|Uint8Array} data - Data to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
async function computeSHA256(data) {
  const encoder = new TextEncoder();
  const buffer = typeof data === 'string' ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract text hash from PDF file
 * @param {File} pdfFile - PDF file object
 * @returns {Promise<string>} SHA-256 hash of extracted text
 */
export async function extractTextHash(pdfFile) {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    // Normalize text (remove extra whitespace)
    const normalizedText = fullText.replace(/\s+/g, ' ').trim();
    
    // Compute SHA-256 hash
    return await computeSHA256(normalizedText);
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw new Error('Failed to extract text hash from PDF');
  }
}

/**
 * Extract image hash from PDF file (rasterized)
 * @param {File} pdfFile - PDF file object
 * @param {number} scale - DPI scale (default: 300/72 for 300 DPI)
 * @returns {Promise<string>} SHA-256 hash of rasterized image
 */
export async function extractImageHash(pdfFile, scale = 300 / 72) {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // First page only
    
    const viewport = page.getViewport({ scale });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Get image data and convert to grayscale
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Convert to grayscale
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
    }
    
    // Compute hash of pixel data
    return await computeSHA256(pixels);
  } catch (error) {
    console.error('Image extraction failed:', error);
    throw new Error('Failed to extract image hash from PDF');
  }
}

/**
 * Extract text from image using OCR
 * @param {File} imageFile - Image file object
 * @returns {Promise<string>} SHA-256 hash of extracted text
 */
export async function extractTextFromImage(imageFile) {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => console.log('OCR Progress:', m)
    });
    
    const normalizedText = result.data.text.replace(/\s+/g, ' ').trim();
    return await computeSHA256(normalizedText);
  } catch (error) {
    console.error('OCR failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Extract image hash from image file (JPG, PNG, etc.)
 * @param {File} imageFile - Image file object
 * @returns {Promise<string>} SHA-256 hash of image pixel data
 */
export async function extractImageHashFromImage(imageFile) {
  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = async () => {
          try {
            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw image to canvas
            context.drawImage(img, 0, 0);
            
            // Get image data and convert to grayscale
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            // Convert to grayscale
            for (let i = 0; i < pixels.length; i += 4) {
              const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
              pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
            }
            
            // Compute hash of pixel data
            const hash = await computeSHA256(pixels);
            resolve(hash);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(imageFile);
    });
  } catch (error) {
    console.error('Image hash extraction failed:', error);
    throw new Error('Failed to extract image hash from image file');
  }
}

/**
 * Extract ROI (Region of Interest) hash from canvas
 * @param {HTMLCanvasElement} canvas - Canvas containing the image
 * @param {Object} boundingBox - Bounding box {x, y, width, height}
 * @returns {Promise<string>} SHA-256 hash of ROI
 */
export async function extractROIHash(canvas, boundingBox) {
  try {
    if (!canvas || !boundingBox) {
      throw new Error('Canvas or bounding box is missing');
    }
    
    if (boundingBox.width <= 0 || boundingBox.height <= 0) {
      throw new Error('Invalid bounding box dimensions');
    }
    
    const context = canvas.getContext('2d');
    const roi = context.getImageData(
      Math.round(boundingBox.x),
      Math.round(boundingBox.y),
      Math.round(boundingBox.width),
      Math.round(boundingBox.height)
    );
    
    console.log('ROI extracted:', { 
      x: Math.round(boundingBox.x), 
      y: Math.round(boundingBox.y), 
      width: Math.round(boundingBox.width), 
      height: Math.round(boundingBox.height),
      dataLength: roi.data.length
    });
    
    return await computeSHA256(roi.data);
  } catch (error) {
    console.error('ROI extraction failed:', error);
    throw new Error(`Failed to extract ROI hash: ${error.message}`);
  }
}

/**
 * Render PDF to canvas for ROI selection
 * @param {File} pdfFile - PDF file object
 * @param {number} scale - DPI scale
 * @returns {Promise<HTMLCanvasElement>} Canvas with rendered PDF
 */
export async function renderPDFToCanvas(pdfFile, scale = 300 / 72) {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    return canvas;
  } catch (error) {
    console.error('PDF rendering failed:', error);
    throw new Error('Failed to render PDF to canvas');
  }
}

/**
 * Compute Merkle root from four hashes
 * @param {string} textHash - Text hash
 * @param {string} imageHash - Image hash
 * @param {string} signatureHash - Signature hash
 * @param {string} stampHash - Stamp hash
 * @returns {Promise<string>} Merkle root hash
 */
export async function computeMerkleRoot(textHash, imageHash, signatureHash, stampHash) {
  try {
    // Level 1: Combine text + image
    const leaf1 = await computeSHA256(textHash + imageHash);
    
    // Level 1: Combine signature + stamp
    const leaf2 = await computeSHA256(signatureHash + stampHash);
    
    // Level 2: Combine both leaves to get root
    const merkleRoot = await computeSHA256(leaf1 + leaf2);
    
    return merkleRoot;
  } catch (error) {
    console.error('Merkle root computation failed:', error);
    throw new Error('Failed to compute Merkle root');
  }
}

/**
 * Extract all hashes from a PDF or image file
 * @param {File} file - PDF or image file object
 * @param {Object|null} signatureBox - Signature bounding box or null
 * @param {Object|null} stampBox - Stamp bounding box or null
 * @returns {Promise<Object>} Object containing all hashes and merkle root
 */
export async function extractAllHashes(file, signatureBox = null, stampBox = null) {
  try {
    console.log('Extracting hashes from file:', file.type);
    
    let textHash, imageHash;
    
    // Check if file is PDF or image
    if (file.type === 'application/pdf') {
      console.log('Processing as PDF...');
      // Extract text and image hashes from PDF
      [textHash, imageHash] = await Promise.all([
        extractTextHash(file),
        extractImageHash(file)
      ]);
    } else if (file.type.startsWith('image/')) {
      console.log('Processing as image...');
      // Extract text (via OCR) and image hashes from image
      [textHash, imageHash] = await Promise.all([
        extractTextFromImage(file),
        extractImageHashFromImage(file)
      ]);
    } else {
      throw new Error('Unsupported file type. Only PDF and image files are supported.');
    }
    
    console.log('Base hashes extracted:', { textHash: textHash.substring(0, 16), imageHash: imageHash.substring(0, 16) });
    
    // Extract ROI hashes if bounding boxes provided (only for PDFs)
    let signatureHash = '';
    let stampHash = '';
    
    if ((signatureBox || stampBox) && file.type === 'application/pdf') {
      console.log('Rendering PDF to canvas for ROI extraction...');
      const canvas = await renderPDFToCanvas(file);
      console.log('Canvas rendered:', { width: canvas.width, height: canvas.height });
      
      if (signatureBox) {
        console.log('Extracting signature hash...');
        signatureHash = await extractROIHash(canvas, signatureBox);
        console.log('Signature hash extracted:', signatureHash.substring(0, 16));
      }
      
      if (stampBox) {
        console.log('Extracting stamp hash...');
        stampHash = await extractROIHash(canvas, stampBox);
        console.log('Stamp hash extracted:', stampHash.substring(0, 16));
      }
    }
    
    // Compute Merkle root
    const merkleRoot = await computeMerkleRoot(
      textHash,
      imageHash,
      signatureHash,
      stampHash
    );
    
    console.log('Merkle root computed:', merkleRoot.substring(0, 16));
    
    return {
      textHash,
      imageHash,
      signatureHash,
      stampHash,
      merkleRoot
    };
  } catch (error) {
    console.error('Hash extraction failed:', error);
    throw error;
  }
}
