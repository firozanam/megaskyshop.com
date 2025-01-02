import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { uploadFile, deleteFile, listFiles } from '@/lib/storage'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const files = await listFiles()
        // Ensure consistent response format
        const formattedFiles = (Array.isArray(files) ? files : []).map(file => ({
            name: file.name || file.pathname || 'Unknown File',
            url: file.url,
            size: file.size || 0,
            uploadedAt: file.uploadedAt || new Date().toISOString()
        }))

        return NextResponse.json({ 
            files: formattedFiles,
            cursor: null // Keep cursor for backward compatibility
        })
    } catch (error) {
        console.error('Error listing files:', error)
        return NextResponse.json({ 
            error: 'Failed to list files',
            details: error.message,
            files: [] // Always return an array, even on error
        }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file')
        
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const url = await uploadFile(file)
        return NextResponse.json({ 
            url,
            name: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString()
        })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ 
            error: 'Failed to upload file',
            details: error.message
        }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { url } = await request.json()
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        await deleteFile(url)
        return NextResponse.json({ message: 'File deleted successfully' })
    } catch (error) {
        console.error('Error deleting file:', error)
        return NextResponse.json({ 
            error: 'Failed to delete file',
            details: error.message
        }, { status: 500 })
    }
}
