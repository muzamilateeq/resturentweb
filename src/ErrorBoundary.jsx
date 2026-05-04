import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('UI error boundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <strong>Something went wrong.</strong>
          <p>Please refresh the page. The rest of the restaurant system is still protected.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
