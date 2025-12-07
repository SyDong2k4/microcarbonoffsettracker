// components/TransactionStatus.tsx
"use client"

import { useState, useEffect } from "react"

interface TransactionStatusProps {
  hash?: string
  error: Error | null
  isLoading: boolean
  type?: "record" | "offset" | "initialize"
  onDismiss?: () => void
}

export default function TransactionStatus({
  hash,
  error,
  isLoading,
  type = "record",
  onDismiss
}: TransactionStatusProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isLoading || error || hash) {
      setShow(true)
      const timer = setTimeout(() => {
        if (!isLoading) {
          setShow(false)
          onDismiss?.()
        }
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, error, hash, onDismiss])

  if (!show) return null

  const getTypeLabel = () => {
    switch (type) {
      case "record":
        return "Trip Recording"
      case "offset":
        return "Offset Purchase"
      case "initialize":
        return "Contract Initialization"
      default:
        return "Transaction"
    }
  }

  const getExplorerUrl = () => {
    if (!hash) return ""
    return `https://explorer.iota.org/devnet/txblock/${hash}`
  }

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 max-w-sm w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-full border-2 border-blue-200"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Processing {getTypeLabel()}</p>
              <p className="text-sm text-gray-600 mt-1">
                Please confirm the transaction in your wallet...
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs text-gray-500">Confirming</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div className="bg-white border border-red-200 rounded-xl shadow-xl p-4 max-w-sm w-full">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-800">{getTypeLabel()} Failed</p>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
              
              <div className="mt-3 p-2 bg-red-50 rounded-lg">
                <p className="text-xs font-medium text-red-700 mb-1">Possible reasons:</p>
                <ul className="text-xs text-red-600 space-y-0.5">
                  <li>• Insufficient balance in wallet</li>
                  <li>• Network congestion</li>
                  <li>• Wallet disconnected</li>
                  <li>• Contract not initialized</li>
                </ul>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShow(false)}
                  className="px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hash) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div className="bg-white border border-green-200 rounded-xl shadow-xl p-4 max-w-sm w-full">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-green-800">{getTypeLabel()} Successful!</p>
                <button
                  onClick={() => setShow(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-sm text-green-600 mt-1">
                Transaction confirmed on the IOTA blockchain
              </p>
              
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Status:</span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    Confirmed
                  </span>
                </div>
                
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-600 block mb-1">Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-gray-700 break-all flex-1">
                      {hash.slice(0, 16)}...{hash.slice(-8)}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(hash)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Copy hash"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <a
                  href={getExplorerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  View on Explorer
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This notification will auto-dismiss in a few seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}