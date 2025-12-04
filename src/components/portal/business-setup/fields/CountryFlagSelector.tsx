'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface Country {
    code: 'AE' | 'SA' | 'EG'
    name: string
    flag: string
}

export const COUNTRIES: Country[] = [
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' }
]

export interface CountryFlagSelectorProps {
    value: Country['code']
    onChange: (country: Country['code']) => void
    className?: string
    disabled?: boolean
}

/**
 * Compact country selector with flag icons
 * Designed for modal header positioning
 */
export function CountryFlagSelector({
    value,
    onChange,
    className = '',
    disabled = false
}: CountryFlagSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedCountry = COUNTRIES.find(c => c.code === value) || COUNTRIES[0]

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleSelect = (country: Country) => {
        onChange(country.code)
        setIsOpen(false)
    }

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
          flex items-center gap-2 px-3 py-1.5
          border border-gray-300 dark:border-gray-600
          rounded-md
          bg-white dark:bg-gray-800
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
                aria-label={`Select country: ${selectedCountry.name}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="text-2xl" role="img" aria-label={selectedCountry.name}>
                    {selectedCountry.flag}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedCountry.code}
                </span>
                <ChevronDown className={`
          h-4 w-4 text-gray-500 transition-transform
          ${isOpen ? 'rotate-180' : ''}
        `} />
            </button>

            {isOpen && (
                <div className="
          absolute top-full right-0 mt-1 z-50
          min-w-[200px]
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600
          rounded-md shadow-lg
          py-1
        ">
                    {COUNTRIES.map((country) => (
                        <button
                            key={country.code}
                            type="button"
                            onClick={() => handleSelect(country)}
                            className={`
                w-full flex items-center gap-3 px-4 py-2
                text-left
                hover:bg-gray-50 dark:hover:bg-gray-700
                transition-colors
                ${country.code === value ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              `}
                            role="option"
                            aria-selected={country.code === value}
                        >
                            <span className="text-2xl" role="img" aria-label={country.name}>
                                {country.flag}
                            </span>
                            <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {country.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {country.code}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
