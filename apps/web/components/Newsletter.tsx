'use client'

import { useState } from 'react'

type MessageType = 'success' | 'error'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<MessageType>('success')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setMessage('Please enter your email address.')
      setMessageType('error')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      // Replace this with your real newsletter API call.
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setMessage(
        'Successfully subscribed! Thank you for joining our community.'
      )
      setMessageType('success')
      setEmail('')
    } catch {
      setMessage('Failed to subscribe. Please try again later.')
      setMessageType('error')
    } finally {
      setSubmitting(false)
    }
  }

  const messageClasses =
    messageType === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800'

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="bg-gray-50 py-16"
    >
      <div className="mx-auto max-w-screen-xl px-6 lg:px-12">
        <div className="space-y-8">
          <div className="text-center">
            <h2
              id="newsletter-heading"
              className="mb-4 text-3xl font-bold text-gray-900"
            >
              Get fishing-net marketplace updates
            </h2>

            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Receive new fishnet listings and marketplace updates.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-start"
          >
            <div className="relative flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="newsletter-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                aria-describedby={message ? 'newsletter-message' : undefined}
                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              {submitting && (
                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-hidden="true"
                >
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-32"
            >
              {submitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          {message && (
            <div
              id="newsletter-message"
              role="status"
              aria-live="polite"
              className={`mx-auto max-w-2xl rounded-lg border px-4 py-3 text-sm ${messageClasses}`}
            >
              {message}
            </div>
          )}

          <p className="text-center text-sm text-gray-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
