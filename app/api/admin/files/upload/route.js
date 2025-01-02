import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExtension = path.extname(file.name)
    const fileName = `${uuidv4()}${fileExtension}`
    const uploadDir = path.join(process.cwd(), 'public', 'images')
    const filePath = path.join(uploadDir, fileName)

    try {
        await mkdir(uploadDir, { recursive: true })
        await writeFile(filePath, buffer)
        return NextResponse.json({ message: 'File uploaded successfully', fileName })
    } catch (error) {
        console.error('Error saving file:', error)
        return NextResponse.json({ error: 'Error saving file' }, { status: 500 })
    }
}
