import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function DELETE(request, { params }) {
    const { filename } = params
    const filePath = path.join(process.cwd(), 'public', 'images', filename)

    try {
        fs.unlinkSync(filePath)
        return NextResponse.json({ message: 'File deleted successfully' })
    } catch (error) {
        console.error('Error deleting file:', error)
        return NextResponse.json({ error: 'Error deleting file' }, { status: 500 })
    }
}
