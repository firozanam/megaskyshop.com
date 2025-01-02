'use client'

import { useEffect } from 'react'

export default function Error({ error }) {
  useEffect(() => {
    // Log the error (this replaces the onError functionality from next.config.js)
    console.error('NextJS Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-4">
        {error?.digest
          ? `An error occurred on the server (${error.digest})`
          : 'An error occurred on the client'}
      </p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => window.location.reload()}
      >
        Try again
      </button>
    </div>
  )
}
