'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Trash2, Eye, Copy, Upload } from 'lucide-react'
import { useToast } from "@/components/ui/toast-context"
import { ErrorBoundary } from 'react-error-boundary'
import axios from 'axios'
import { cn } from '@/lib/utils'

function ErrorFallback({error}) {
    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre>{error.message}</pre>
        </div>
    )
}

const FileManagerClient = ({ initialFiles = [] }) => {
    const { toast } = useToast()
    const [files, setFiles] = useState(initialFiles)
    const [isLoading, setIsLoading] = useState(false)
    const [uploadingFile, setUploadingFile] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [uploadStatus, setUploadStatus] = useState('')
    const [error, setError] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)

    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/blob-proxy');
            const fileList = response.data.files || response.data.blobs || [];
            setFiles(Array.isArray(fileList) ? fileList : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching files:', err);
            setError(`Failed to fetch files: ${err.message}`);
            toast({
                title: "Error",
                description: `Failed to fetch files: ${err.message}`,
                variant: "destructive",
            });
            setFiles([]);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const uploadFile = async (file) => {
        if (!file || file.size > 10 * 1024 * 1024) { // 10MB limit
            toast({
                title: "Error",
                description: "File size must be less than 10MB",
                variant: "destructive",
            });
            return;
        }

        setUploadingFile(file);
        setUploadStatus('Uploading...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/blob-proxy', formData);
            const url = response.data.url;
            
            setFiles(prev => {
                const newFiles = Array.isArray(prev) ? prev : [];
                return [{
                    name: file.name,
                    url: url,
                    size: file.size,
                    uploadedAt: new Date().toISOString()
                }, ...newFiles];
            });

            setUploadStatus('Upload complete');
            toast({
                title: "Success",
                description: "File uploaded successfully",
            });
        } catch (err) {
            console.error('Error uploading file:', err);
            setUploadStatus('Upload failed');
            toast({
                title: "Error",
                description: `Failed to upload file: ${err.message}`,
                variant: "destructive",
            });
        } finally {
            setUploadingFile(null);
            setTimeout(() => setUploadStatus(''), 3000);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = async (url) => {
        try {
            await axios.delete('/api/blob-proxy', { data: { url } });
            setFiles(prev => {
                const newFiles = Array.isArray(prev) ? prev : [];
                return newFiles.filter(file => file.url !== url);
            });
            toast({
                title: "Success",
                description: "File deleted successfully",
            });
        } catch (err) {
            console.error('Error deleting file:', err);
            toast({
                title: "Error",
                description: `Failed to delete file: ${err.message}`,
                variant: "destructive",
            });
        }
    };

    const getFullUrl = (url) => {
        try {
            // If it's already a full URL, return it
            new URL(url);
            return url;
        } catch {
            // If it's a relative URL, make it absolute
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
            // Remove leading slashes and join with base URL
            const cleanUrl = url.replace(/^\/+/, '');
            return `${baseUrl}/${cleanUrl}`;
        }
    };

    const handleCopyUrl = (url) => {
        const fullUrl = getFullUrl(url);
        navigator.clipboard.writeText(fullUrl);
        toast({
            title: "Success",
            description: "URL copied to clipboard",
        });
    };

    const handlePreview = (file) => {
        setSelectedFile(file);
        setIsModalOpen(true);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className="p-4 space-y-6">
                {/* Upload Section */}
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out",
                        isDragging ? "border-primary bg-primary/5" : "border-gray-300",
                        "relative flex flex-col items-center justify-center text-center"
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        disabled={!!uploadingFile}
                    />
                    
                    <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-semibold">
                                {uploadingFile ? 'Uploading...' : 'Click to upload'}
                            </p>
                            <p className="text-sm text-gray-500">
                                or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                Images up to 10MB
                            </p>
                        </div>
                        {!uploadingFile && (
                            <Button
                                onClick={handleUploadClick}
                                variant="outline"
                                disabled={!!uploadingFile}
                            >
                                Select File
                            </Button>
                        )}
                        {uploadingFile && (
                            <div className="flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span>{uploadStatus}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Files Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : Array.isArray(files) && files.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
                        {files.map((file, index) => (
                            <div key={file.url || index} className="relative group bg-background rounded-lg shadow-md overflow-hidden w-full">
                                {/* Square Image Container */}
                                <div className="relative w-full pt-[100%]">
                                    <div className="absolute inset-0 bg-gray-100">
                                        <Image
                                            src={file.url}
                                            alt={file.name}
                                            fill
                                            sizes="100vw"
                                            className="object-cover hover:scale-105 transition-transform duration-200"
                                            priority={index < 4}
                                        />
                                    </div>
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 bg-white hover:bg-white/90 hover:scale-105 transition-all shadow-sm"
                                            onClick={() => handlePreview(file)}
                                        >
                                            <Eye className="h-4 w-4 text-primary" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 bg-white hover:bg-white/90 hover:scale-105 transition-all shadow-sm"
                                            onClick={() => handleCopyUrl(file.url)}
                                        >
                                            <Copy className="h-4 w-4 text-primary" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 bg-white hover:bg-white/90 hover:scale-105 transition-all shadow-sm"
                                            onClick={() => handleDelete(file.url)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                {/* File Info */}
                                <div className="p-2 text-xs">
                                    <div className="truncate text-foreground/90">{file.name}</div>
                                    <div className="flex justify-between text-muted-foreground mt-1">
                                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                        <span>{formatFileSize(file.size)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p>No files uploaded yet.</p>
                    </div>
                )}

                {/* Preview Modal */}
                {isModalOpen && selectedFile && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
                            <div className="relative h-[600px]">
                                <Image
                                    src={selectedFile.url}
                                    alt={selectedFile.name}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <p className="text-sm">{selectedFile.name}</p>
                                <Button onClick={() => setIsModalOpen(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default FileManagerClient;
