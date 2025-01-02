import { NextResponse } from 'next/server';
import { deleteFromBlob } from '@/lib/blobStorage';

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    await deleteFromBlob(url);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
