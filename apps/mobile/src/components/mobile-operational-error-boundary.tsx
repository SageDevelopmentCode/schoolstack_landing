import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View } from 'react-native';

import { Brand } from '@/constants/theme';
import { reportMobileGlobalOperationalError } from '@/lib/mobile-global-error-reporting';

type MobileOperationalErrorBoundaryProps = {
  children: ReactNode;
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
    reportMobileGlobalOperationalError('react_render_error', error, {
      details: info.componentStack?.trim().slice(0, 2000),
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <View style={{ flex: 1, backgroundColor: Brand.bg }} />;
    }

    return this.props.children;
  }
}
