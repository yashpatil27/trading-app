'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import PinInput from './PinInput'

interface PinConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pin: string) => Promise<boolean>
  title: string
  description: string
  isLoading?: boolean
}

export default function PinConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false
}: PinConfirmationModalProps) {
  const [pin, setPin] = useState('')
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin('')
      setIsError(false)
      setIsSubmitting(false)
    }
  }, [isOpen])

  // Auto-submit when PIN is complete
  useEffect(() => {
    if (pin.length === 4 && !isSubmitting) {
      handleSubmit()
    }
  }, [pin, isSubmitting])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (pin.length !== 4 || isSubmitting) return

    setIsSubmitting(true)
    setIsError(false)

    try {
      const isValid = await onConfirm(pin)
      
      if (isValid) {
        // Success - modal will close via parent component
        setPin('')
      } else {
        // Invalid PIN
        setIsError(true)
        setPin('')
        setTimeout(() => setIsError(false), 500)
      }
    } catch (error) {
      console.error('PIN confirmation error:', error)
      setIsError(true)
      setPin('')
      setTimeout(() => setIsError(false), 500)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) {
      setPin('')
      setIsError(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black rounded-lg p-6 w-full max-w-md mx-4 border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-center mb-6">
          {description}
        </p>

        {/* PIN Input */}
        <div className="mb-6">
          <PinInput
            value={pin}
            onChange={setPin}
            isError={isError}
            disabled={isSubmitting || isLoading}
          />
        </div>

        {/* Error Message */}
        {isError && (
          <div className="text-white text-center text-sm mb-4">
            Incorrect PIN. Please try again.
          </div>
        )}

        {/* Loading State */}
        {(isSubmitting || isLoading) && (
          <div className="text-center text-gray-400 text-sm mb-4">
            Processing...
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-gray-500 text-xs">
          Enter your 4-digit trading PIN to confirm this transaction
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCancel}
            disabled={isSubmitting || isLoading}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4 || isSubmitting || isLoading}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
