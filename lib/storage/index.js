import { getDatabase } from '@/lib/mongodb'
import LocalStorage from './local'
import S3Storage from './s3'
import BlobStorage from './blob'

let storageInstance = null
let lastError = null

export async function getStorageProvider() {
    // If we have a valid instance, return it
    if (storageInstance) {
        return storageInstance
    }

    try {
        const db = await getDatabase()
        const settings = await db.collection('settings').findOne({ key: 'storage' })
        const config = settings?.value || { local: { enabled: true, path: 'uploads' } }

        // Find the enabled provider
        const enabledProvider = Object.entries(config).find(([_, conf]) => conf.enabled)
        
        if (!enabledProvider) {
            console.log('No storage provider enabled, defaulting to local storage')
            lastError = 'No storage provider enabled'
            storageInstance = new LocalStorage({ enabled: true, path: 'uploads' })
            return storageInstance
        }

        const [provider, providerConfig] = enabledProvider

        console.log('Selected storage provider:', provider)
        console.log('Provider config:', providerConfig)

        // Create and test the storage instance
        switch (provider) {
            case 's3':
                if (!providerConfig.accessKey || !providerConfig.secretKey || !providerConfig.bucket || !providerConfig.region) {
                    throw new Error('Invalid S3 configuration: missing required fields')
                }
                storageInstance = new S3Storage(providerConfig)
                break
            case 'vercelBlob':
                if (!providerConfig.token) {
                    throw new Error('Invalid Vercel Blob configuration: token is required')
                }
                storageInstance = new BlobStorage(providerConfig)
                break
            case 'local':
                storageInstance = new LocalStorage(providerConfig)
                break
            default:
                throw new Error(`Unknown storage provider: ${provider}`)
        }

        // Test the storage instance
        await storageInstance.list()
        console.log(`${provider} storage provider initialized successfully`)
        lastError = null
        return storageInstance

    } catch (error) {
        console.error('Storage provider error:', error)
        lastError = error.message

        // Clear the failed instance
        storageInstance = null

        // Don't fall back to local storage if it was the one that failed
        const currentProvider = error.message.toLowerCase().includes('local storage') ? 'local' : 
                              error.message.toLowerCase().includes('vercel blob') ? 'vercelBlob' : 
                              error.message.toLowerCase().includes('s3') ? 's3' : null

        if (currentProvider !== 'local') {
            console.error(`${currentProvider} storage provider failed, falling back to local storage`)
            try {
                storageInstance = new LocalStorage({ enabled: true, path: 'uploads' })
                await storageInstance.list() // Test local storage
                return storageInstance
            } catch (localError) {
                console.error('Local storage fallback failed:', localError)
                throw new Error(`Storage system unavailable: ${localError.message}`)
            }
        }

        throw new Error(`Storage provider failed: ${error.message}`)
    }
}

export function getLastStorageError() {
    return lastError
}

export function resetStorageInstance() {
    console.log('Resetting storage instance')
    storageInstance = null
    lastError = null
}

export async function uploadFile(file) {
    const storage = await getStorageProvider()
    if (!storage) {
        throw new Error('No storage provider available')
    }
    
    try {
        return await storage.upload(file)
    } catch (error) {
        console.error('Error uploading file:', error)
        throw error
    }
}

export async function deleteFile(url) {
    const storage = await getStorageProvider()
    if (!storage) {
        throw new Error('No storage provider available')
    }
    
    try {
        return await storage.delete(url)
    } catch (error) {
        console.error('Error deleting file:', error)
        throw error
    }
}

export async function listFiles() {
    const storage = await getStorageProvider()
    if (!storage) {
        throw new Error('No storage provider available')
    }
    
    try {
        const files = await storage.list()
        return Array.isArray(files) ? files : []
    } catch (error) {
        console.error('Error listing files:', error)
        throw error
    }
}

export async function getFileUrl(path) {
    const storage = await getStorageProvider()
    if (!storage) {
        throw new Error('No storage provider available')
    }
    
    try {
        return await storage.getUrl(path)
    } catch (error) {
        console.error('Error getting file URL:', error)
        return path
    }
}
