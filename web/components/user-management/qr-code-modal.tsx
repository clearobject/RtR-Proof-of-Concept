'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { X, Copy, Download } from 'lucide-react'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  inviteUrl: string
}

export function QRCodeModal({ isOpen, onClose, inviteUrl }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && canvasRef.current && inviteUrl) {
      QRCode.toCanvas(canvasRef.current, inviteUrl, {
        width: 300,
        margin: 2,
      }, (error) => {
        if (error) console.error('QR code generation error:', error)
      })
    }
  }, [isOpen, inviteUrl])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = async () => {
    if (!canvasRef.current) return
    
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'invite-qr-code.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Invite QR Code</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <canvas ref={canvasRef} className="border border-gray-200 rounded" />
          
          <div className="w-full">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
              <input
                type="text"
                value={inviteUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

