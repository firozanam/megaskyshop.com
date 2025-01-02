import { put, del, list } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export default class BlobStorage {
    constructor(config) {
        if (!config?.token) {
            throw new Error('Vercel Blob token is required')
        }
        
        // Use process.env token if available, otherwise use config token
        this.token = process.env.BLOB_READ_WRITE_TOKEN || config.token
        
        if (!this.token) {
            throw new Error('No valid Vercel Blob token found')
        }
    }

    async validateToken() {
        try {
            console.log('Validating Vercel Blob token...')
            // Try a minimal operation to validate the token
            const { blobs } = await list({ token: this.token, limit: 1 })
            console.log('Token validation successful')
            return true
        } catch (error) {
            console.error('Token validation error:', error)
            if (error.message.includes('Access denied') || error.name === 'BlobAccessError') {
                throw new Error(`Invalid Vercel Blob token: ${error.message}`)
            }
            throw error
        }
    }

    async upload(file) {
        await this.validateToken()
        try {
            console.log('Uploading file to Vercel Blob:', file.name)
            const filename = `${uuidv4()}-${file.name}`
            
            // Convert File/Blob to ArrayBuffer if needed
            let fileData = file
            if (file instanceof File || file instanceof Blob) {
                fileData = await file.arrayBuffer()
            }
            
            const { url } = await put(filename, fileData, {
                access: 'public',
                token: this.token,
                addRandomSuffix: false // Ensure we use our exact filename
            })
            
            console.log('File uploaded successfully to Vercel Blob:', url)
            return url
        } catch (error) {
            console.error('Error uploading to Vercel Blob:', error)
            throw new Error(`Vercel Blob upload failed: ${error.message}`)
        }
    }

    async delete(url) {
        await this.validateToken()
        try {
            console.log('Deleting file from Vercel Blob:', url)
            await del(url, { token: this.token })
            console.log('File deleted successfully from Vercel Blob')
        } catch (error) {
            console.error('Error deleting from Vercel Blob:', error)
            throw new Error(`Vercel Blob deletion failed: ${error.message}`)
        }
    }

    async list() {
        await this.validateToken()
        try {
            console.log('Listing Vercel Blob files...')
            const { blobs } = await list({ token: this.token })
            console.log('Vercel Blob files found:', blobs.length)
            
            return blobs.map(blob => ({
                name: blob.pathname.split('/').pop() || blob.pathname,
                url: blob.url,
                size: blob.size || 0,
                uploadedAt: blob.uploadedAt || new Date().toISOString()
            }))
        } catch (error) {
            console.error('Error listing Vercel Blob files:', error)
            throw new Error(`Vercel Blob listing failed: ${error.message}`)
        }
    }

    getUrl(url) {
        return url
    }
}
