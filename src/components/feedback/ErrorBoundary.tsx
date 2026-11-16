import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  fallback: (reset: () => void) => ReactNode;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Keeps a failing section (e.g. a visualisation) from taking the whole page down. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  override render() {
    return this.state.error ? this.props.fallback(this.reset) : this.props.children;
  }
}
