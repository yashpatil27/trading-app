'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'

interface PinInputProps {
  value: string
  onChange: (pin: string) => void
  isError?: boolean
  disabled?: boolean
}

export default function PinInput({ value, onChange, isError = false, disabled = false }: PinInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [shake, setShake] = useState(false)

  // Split PIN into array of digits
  const digits = value.padEnd(4, '').split('').slice(0, 4)

  useEffect(() => {
    if (isError) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }, [isError])

  const handleInputChange = (index: number, digit: string) => {
    if (disabled) return
    
    // Only allow single digits
    const cleanDigit = digit.replace(/\D/g, '').slice(-1)
    
    const newDigits = [...digits]
    newDigits[index] = cleanDigit
    
    const newPin = newDigits.join('').replace(/\s/g, '')
    onChange(newPin)

    // Auto-focus next input
    if (cleanDigit && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return
    
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    onChange(pastedData)
  }

  return (
    <div className={`flex gap-3 justify-center ${shake ? 'animate-shake' : ''}`}>
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digits[index] || ''}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-xl font-semibold rounded-lg border-2 
            bg-zinc-800 text-white
            transition-all duration-200
            ${isError 
              ? 'border-red-500 bg-red-900/20' 
              : 'border-zinc-600 focus:border-orange-500'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'focus:outline-none focus:ring-2 focus:ring-orange-500/50'
            }
          `}
          autoComplete="off"
        />
      ))}
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
