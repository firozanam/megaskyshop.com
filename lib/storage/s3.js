import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

export default class S3Storage {
    constructor(config) {
        this.bucket = config.bucket
        this.region = config.region
        this.client = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKey,
                secretAccessKey: config.secretKey
            }
        })
    }

    async upload(file) {
        try {
            const filename = `${uuidv4()}-${file.name}`
            const buffer = Buffer.from(await file.arrayBuffer())

            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: filename,
                Body: buffer,
                ContentType: file.type
            })

            await this.client.send(command)
            return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filename}`
        } catch (error) {
            console.error('Error uploading to S3:', error)
            throw error
        }
    }

    async delete(url) {
        try {
            const filename = url.split('/').pop()
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: filename
            })
            await this.client.send(command)
        } catch (error) {
            console.error('Error deleting from S3:', error)
            throw error
        }
    }

    async list() {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucket
            })
            const { Contents = [] } = await this.client.send(command)
            
            return Contents.map(item => ({
                name: item.Key,
                url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${item.Key}`
            }))
        } catch (error) {
            console.error('Error listing S3 files:', error)
            return []
        }
    }

    async getUrl(key) {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        })
        return getSignedUrl(this.client, command, { expiresIn: 3600 })
    }
}
