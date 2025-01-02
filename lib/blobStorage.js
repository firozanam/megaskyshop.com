import { put, del, list } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export async function uploadToBlob(file) {
  try {
    console.log('Uploading file to blob storage...');
    const filename = `${uuidv4()}-${file.name}`;
    const { url } = await put(filename, file, { 
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });
    console.log('File uploaded successfully:', url);
    return url;
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw error;
  }
}

export async function deleteFromBlob(url) {
  try {
    console.log('Deleting file from blob storage:', url);
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting from blob:', error);
    throw error;
  }
}

export async function listBlobFiles() {
  try {
    console.log('Listing blob files...');
    const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    console.log('Blob files listed:', blobs.length);
    return blobs;
  } catch (error) {
    console.error('Error listing blob files:', error);
    throw error;
  }
}

export function getBlobImageUrl(url) {
  return url;
}

export function getImageWithFallback(url) {
  if (!url) return '/images/placeholder.png';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;
  return '/images/placeholder.png';
}
