import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { uploadFile } from '@/lib/storage'

export const dynamic = 'force-dynamic';

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
        return NextResponse.json({ url })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
