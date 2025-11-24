import React, { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface DropZoneProps {
    onFilesAccepted: (files: File[]) => void
    accept?: Record<string, string[]>
    maxSize?: number // in bytes
    maxFiles?: number
    disabled?: boolean
    className?: string
}

export function DropZone({
    onFilesAccepted,
    accept,
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 5,
    disabled = false,
    className
}: DropZoneProps) {
    const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (acceptedFiles.length > 0) {
            onFilesAccepted(acceptedFiles)
        }

        if (fileRejections.length > 0) {
            fileRejections.forEach(({ file, errors }) => {
                errors.forEach(error => {
                    if (error.code === 'file-too-large') {
                        toast.error(`File ${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`)
                    } else if (error.code === 'file-invalid-type') {
                        toast.error(`File ${file.name} has an invalid type`)
                    } else if (error.code === 'too-many-files') {
                        toast.error(`Too many files. Max allowed is ${maxFiles}`)
                    } else {
                        toast.error(`Error uploading ${file.name}: ${error.message}`)
                    }
                })
            })
        }
    }, [onFilesAccepted, maxSize, maxFiles])

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles,
        disabled
    })

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative border-2 border-dashed rounded-lg p-8 transition-colors duration-200 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center gap-4",
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50",
                isDragReject && "border-red-500 bg-red-50",
                disabled && "opacity-50 cursor-not-allowed hover:border-gray-300",
                className
            )}
        >
            <input {...getInputProps()} />

            <div className={cn(
                "p-4 rounded-full bg-white shadow-sm",
                isDragActive ? "text-blue-500" : "text-gray-400"
            )}>
                <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                    {isDragActive ? "Drop files here" : "Click or drag files to upload"}
                </p>
                <p className="text-xs text-gray-500">
                    Max {maxFiles} files, up to {maxSize / 1024 / 1024}MB each
                </p>
            </div>
        </div>
    )
}
