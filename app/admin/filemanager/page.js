import { listBlobFiles } from '@/lib/blobStorage';
import FileManagerClient from './FileManagerClient';

export default async function FileManager() {
    // Fetch initial files from Vercel Blob
    const blobFiles = await listBlobFiles();
    
    return <FileManagerClient initialFiles={blobFiles} />;
}
