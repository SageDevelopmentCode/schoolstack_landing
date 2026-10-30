import { Component, type ErrorInfo, type ReactNode } from 'react';

import { MobileOperationalErrorFallback } from '@/components/mobile-operational-error-fallback';
import { reportMobileGlobalOperationalError } from '@/lib/mobile-global-error-reporting';

type MobileOperationalErrorBoundaryProps = {
  children: ReactNode;
  pathname?: string;
  onGoBack?: () => void;
};

type MobileOperationalErrorBoundaryState = {
  hasError: boolean;
};

export class MobileOperationalErrorBoundary extends Component<
  MobileOperationalErrorBoundaryProps,
  MobileOperationalErrorBoundaryState
> {
  state: MobileOperationalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): MobileOperationalErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const pathname = this.props.pathname?.trim();
    reportMobileGlobalOperationalError('react_render_error', error, {
      details: info.componentStack?.trim().slice(0, 2000),
      metadata: pathname ? { pathname } : undefined,
    });
  }

  componentDidUpdate(prevProps: MobileOperationalErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      prevProps.pathname !== this.props.pathname &&
      this.props.pathname !== undefined
    ) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <MobileOperationalErrorFallback onGoBack={this.props.onGoBack} />;
    }

    return this.props.children;
  }
}
