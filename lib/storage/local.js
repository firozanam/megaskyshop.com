import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export default class LocalStorage {
    constructor(config) {
        // Make path relative to project root
        this.uploadPath = path.join(process.cwd(), 'public', config.path || 'uploads')
        // Get base URL from environment
        this.baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        // Ensure upload directory exists
        this.ensureUploadDir()
    }

    async ensureUploadDir() {
        try {
            await fs.access(this.uploadPath)
            console.log('Upload directory exists:', this.uploadPath)
        } catch {
            console.log('Creating upload directory:', this.uploadPath)
            await fs.mkdir(this.uploadPath, { recursive: true })
        }
    }

    getFullUrl(relativePath) {
        // For local storage, we'll use relative URLs in development
        if (process.env.NODE_ENV === 'development') {
            // Remove leading slash if present and ensure it starts with /
            const cleanPath = relativePath.replace(/^\/+/, '')
            return `/${cleanPath}`
        }

        // In production, use full URLs
        const cleanPath = relativePath.replace(/^\/+/, '')
        return new URL(cleanPath, this.baseUrl).toString()
    }

    async upload(file) {
        await this.ensureUploadDir()
        const filename = `${uuidv4()}-${file.name}`
        const filePath = path.join(this.uploadPath, filename)
        
        const buffer = Buffer.from(await file.arrayBuffer())
        await fs.writeFile(filePath, buffer)
        
        // Return URL relative to public directory
        const relativePath = path.join('uploads', filename)
        return this.getFullUrl(relativePath)
    }

    async delete(url) {
        try {
            // Extract filename from URL, handling both relative and absolute URLs
            let filename
            try {
                const urlObj = new URL(url)
                filename = path.basename(urlObj.pathname)
            } catch {
                // If URL parsing fails, assume it's a relative path
                filename = path.basename(url)
            }

            const filePath = path.join(this.uploadPath, filename)
            await fs.unlink(filePath)
            console.log('File deleted successfully:', filePath)
        } catch (error) {
            console.error('Error deleting file:', error)
            throw error
        }
    }

    async list() {
        try {
            console.log('Listing files in:', this.uploadPath)
            const files = await fs.readdir(this.uploadPath)
            console.log('Found files:', files.length)

            const fileStats = await Promise.all(
                files.map(async (filename) => {
                    const filePath = path.join(this.uploadPath, filename)
                    try {
                        const stats = await fs.stat(filePath)
                        return {
                            name: filename,
                            url: this.getFullUrl(path.join('uploads', filename)),
                            size: stats.size,
                            uploadedAt: stats.mtime.toISOString()
                        }
                    } catch (error) {
                        console.error(`Error getting stats for ${filename}:`, error)
                        return null
                    }
                })
            )

            return fileStats.filter(Boolean)
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('Upload directory does not exist, creating it...')
                await this.ensureUploadDir()
                return []
            }
            console.error('Error listing files:', error)
            throw error
        }
    }

    getUrl(url) {
        // If it's already a full URL and we're in production, return as is
        if (process.env.NODE_ENV !== 'development') {
            try {
                new URL(url)
                return url
            } catch {
                // If it's a relative path, convert to full URL
                return this.getFullUrl(url)
            }
        }
        
        // In development, always use relative URLs
        return this.getFullUrl(url)
    }
}
