import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getDatabase } from '@/lib/mongodb'
import { resetStorageInstance } from '@/lib/storage'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = await getDatabase()
        const settings = await db.collection('settings').findOne({ key: 'storage' })
        
        console.log('Current storage settings:', settings?.value)
        
        return NextResponse.json({
            settings: settings?.value || {
                local: {
                    enabled: true,
                    path: 'uploads'
                },
                vercelBlob: {
                    enabled: false,
                    token: ''
                },
                s3: {
                    enabled: false,
                    accessKey: '',
                    secretKey: '',
                    bucket: '',
                    region: ''
                }
            }
        })
    } catch (error) {
        console.error('Error fetching storage settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { settings } = await request.json()
        if (!settings) {
            return NextResponse.json({ error: 'Settings are required' }, { status: 400 })
        }

        console.log('Updating storage settings:', settings)

        // Validate that only one storage provider is enabled
        const enabledProviders = Object.entries(settings)
            .filter(([_, config]) => config.enabled)
            .map(([provider]) => provider)

        console.log('Enabled providers:', enabledProviders)

        if (enabledProviders.length !== 1) {
            return NextResponse.json({ 
                error: 'Exactly one storage provider must be enabled' 
            }, { status: 400 })
        }

        // Basic validation for the enabled provider
        const enabledProvider = enabledProviders[0]
        const config = settings[enabledProvider]

        // Ensure local storage path doesn't start with '/'
        if (enabledProvider === 'local' && config.path) {
            config.path = config.path.replace(/^\/+/, '')
        }

        switch (enabledProvider) {
            case 'local':
                if (!config.path) {
                    return NextResponse.json({ 
                        error: 'Upload path is required for local storage' 
                    }, { status: 400 })
                }
                break
            case 'vercelBlob':
                if (!config.token) {
                    return NextResponse.json({ 
                        error: 'Token is required for Vercel Blob storage' 
                    }, { status: 400 })
                }
                break
            case 's3':
                if (!config.accessKey || !config.secretKey || !config.bucket || !config.region) {
                    return NextResponse.json({ 
                        error: 'All S3 configuration fields are required' 
                    }, { status: 400 })
                }
                break
        }

        const db = await getDatabase()
        await db.collection('settings').updateOne(
            { key: 'storage' },
            { $set: { key: 'storage', value: settings } },
            { upsert: true }
        )

        // Reset the storage instance to force recreation with new settings
        resetStorageInstance()
        console.log('Storage settings updated, instance reset')

        return NextResponse.json({ message: 'Storage settings updated successfully' })
    } catch (error) {
        console.error('Error updating storage settings:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
