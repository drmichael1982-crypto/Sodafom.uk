import { Component, type ErrorInfo, type ReactNode } from "react";

interface ThreeSceneErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ThreeSceneErrorBoundaryState {
  error: Error | null;
}

export class ThreeSceneErrorBoundary extends Component<
  ThreeSceneErrorBoundaryProps,
  ThreeSceneErrorBoundaryState
> {
  state: ThreeSceneErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ThreeSceneErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div role="status" aria-live="polite">
            3D view is unavailable on this device.
          </div>
        )
      );
    }

    return this.props.children;
  }
}
