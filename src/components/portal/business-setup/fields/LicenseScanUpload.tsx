'use client'

/**
 * License Scan Upload Component
 * Upload trade license image/PDF and auto-fill form fields
 */

import { useState, useRef } from 'react'
import { Upload, Camera, FileText, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export interface LicenseData {
  businessName: string | null
  licenseNumber: string | null
  economicDepartment: string | null
  expiryDate: string | null
  legalForm: string | null
  country: string | null
  confidence: number
}

interface LicenseScanUploadProps {
  onDataExtracted: (data: LicenseData) => void
  onClose?: () => void
}

export function LicenseScanUpload({ onDataExtracted, onClose }: LicenseScanUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [extractedData, setExtractedData] = useState<LicenseData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image (JPG, PNG) or PDF file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsProcessing(true)
    setExtractedData(null)

    try {
      // Call OCR API
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/portal/license/scan', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.error || 'Failed to process license')
        return
      }

      setExtractedData(result.data)
      toast.success('License data extracted successfully!')
    } catch (error) {
      toast.error('Failed to process license image')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleApply = () => {
    if (extractedData) {
      onDataExtracted(extractedData)
      if (onClose) onClose()
    }
  }

  const confidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-400'
    if (confidence >= 0.6) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!extractedData && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging 
              ? 'border-teal-500 bg-teal-500/10' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'}
            ${isProcessing ? 'pointer-events-none opacity-60' : ''}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {isProcessing ? (
            <div className="space-y-3">
              <Loader2 className="w-10 h-10 mx-auto text-teal-400 animate-spin" />
              <p className="text-gray-300">Processing license...</p>
              <p className="text-sm text-gray-500">Extracting business details</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-gray-400" />
                </div>
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <p className="text-gray-300 font-medium">Upload Trade License</p>
              <p className="text-sm text-gray-500">
                Drag & drop or click to upload (JPG, PNG, PDF)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-green-400" />
              Extracted Data
            </h3>
            <span className={`text-sm ${confidenceColor(extractedData.confidence)}`}>
              {Math.round(extractedData.confidence * 100)}% confidence
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Business Name</p>
              <p className="text-white">{extractedData.businessName || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">License Number</p>
              <p className="text-white">{extractedData.licenseNumber || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Department</p>
              <p className="text-white truncate">{extractedData.economicDepartment || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Country</p>
              <p className="text-white">{extractedData.country || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Legal Form</p>
              <p className="text-white">{extractedData.legalForm || '—'}</p>
            </div>
            <div>
              <p className="text-gray-500">Expiry Date</p>
              <p className="text-white">{extractedData.expiryDate || '—'}</p>
            </div>
          </div>

          {extractedData.confidence < 0.7 && (
            <div className="flex items-start gap-2 text-sm text-orange-400 bg-orange-500/10 p-2 rounded">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Low confidence - please verify the extracted data</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setExtractedData(null)}
              className="flex-1 border-gray-700"
            >
              Scan Again
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              Apply Data
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LicenseScanUpload
