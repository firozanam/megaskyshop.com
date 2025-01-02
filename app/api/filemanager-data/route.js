import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { listFiles } from '@/lib/storage'

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const files = await listFiles()
        return NextResponse.json({ files })
    } catch (error) {
        console.error('Error listing files:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
