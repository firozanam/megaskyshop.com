import { NextResponse } from 'next/server';
import { listBlobFiles } from '@/lib/blobStorage';

export async function GET() {
  try {
    const files = await listBlobFiles();
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
