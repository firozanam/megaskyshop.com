import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
    const directory = path.join(process.cwd(), 'public', 'images');
    
    try {
        const files = await fs.promises.readdir(directory);
        return NextResponse.json(files);
    } catch (error) {
        console.error('Error reading directory:', error);
        return NextResponse.json({ error: 'Failed to read files' }, { status: 500 });
    }
}
