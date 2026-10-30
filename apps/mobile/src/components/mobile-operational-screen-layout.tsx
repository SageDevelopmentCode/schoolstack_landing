import { Component, type ComponentType, type ReactNode } from 'react';

import { MobileOperationalRouteErrorBoundary } from '@/components/mobile-operational-route-error-boundary';

type TryProps = {
  catch: ComponentType<import('expo-router').ErrorBoundaryProps>;
  children: ReactNode;
};

type TryState = {
  error?: Error;
};

/** Mirrors expo-router Try so screenLayout can keep the Stack mounted on render errors. */
class MobileOperationalScreenTry extends Component<TryProps, TryState> {
  state: TryState = { error: undefined };

  static getDerivedStateFromError(error: Error): TryState {
    return { error };
  }

  retry = (): Promise<void> =>
    new Promise((resolve) => {
      this.setState({ error: undefined }, () => {
        resolve();
      });
    });

  render(): ReactNode {
    const { error } = this.state;
    const { catch: ErrorBoundary, children } = this.props;
    if (!error) {
      return children;
    }
    return <ErrorBoundary error={error} retry={this.retry} />;
  }
}

type MobileOperationalScreenLayoutProps = {
  children: ReactNode;
};

export function MobileOperationalScreenLayout({
  children,
}: MobileOperationalScreenLayoutProps) {
  return (
    <MobileOperationalScreenTry catch={MobileOperationalRouteErrorBoundary}>
      {children}
    </MobileOperationalScreenTry>
  );
}
