'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[300px] p-10 text-center"
          style={{ color: 'var(--text)' }}
        >
          <p className="text-3xl mb-4">⚠</p>
          <p className="text-[15px] font-semibold mb-2">Something went wrong</p>
          <p className="text-[13px] max-w-sm" style={{ color: 'var(--muted)' }}>
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-6 px-4 py-2 rounded-[6px] text-[13px] font-medium"
            style={{ background: 'rgba(1,180,175,0.15)', color: 'var(--teal)', border: '1px solid var(--teal)' }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
