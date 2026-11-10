import type { ComponentType } from 'react';
import React from 'react';
import { act, create } from 'react-test-renderer';

const mockRequireOptionalNativeModule = jest.fn();

jest.mock('expo', () => ({
  requireOptionalNativeModule: (name: string) => mockRequireOptionalNativeModule(name),
}));

describe('mobile-observe-stub', () => {
  it('ObserveRoot.wrap returns the same component', () => {
    const { ObserveRoot } = require('./mobile-observe-stub') as typeof import('./mobile-observe-stub');

    function Screen() {
      return null;
    }

    expect(ObserveRoot.wrap(Screen)).toBe(Screen);
  });

  it('useObserve markInteractive does not throw', () => {
    const { useObserve } = require('./mobile-observe-stub') as typeof import('./mobile-observe-stub');

    function Probe() {
      const { markInteractive } = useObserve();
      markInteractive();
      return null;
    }

    expect(() => {
      act(() => {
        create(<Probe />);
      });
    }).not.toThrow();
  });
});

describe('mobile-observe gate', () => {
  beforeEach(() => {
    jest.resetModules();
    mockRequireOptionalNativeModule.mockReset();
  });

  it('loads stub when ExpoAppMetrics or ExpoObserve is missing', () => {
    mockRequireOptionalNativeModule.mockReturnValue(null);

    const stub = require('./mobile-observe-stub') as typeof import('./mobile-observe-stub');
    const gate = require('./mobile-observe') as typeof import('./mobile-observe');

    function Screen() {
      return null;
    }

    expect(gate.ObserveRoot.wrap(Screen)).toBe(Screen);
    expect(gate.Observe.configure).toBe(stub.Observe.configure);
    expect(mockRequireOptionalNativeModule).toHaveBeenCalledWith('ExpoAppMetrics');
  });

  it('loads enabled implementation when native modules exist', () => {
    const mockConfigure = jest.fn();

    jest.doMock('expo-observe', () => ({
      Observe: { configure: mockConfigure },
      ObserveRoot: { wrap: (Component: ComponentType) => Component },
      useObserve: () => ({ markInteractive: jest.fn() }),
    }));

    jest.resetModules();
    mockRequireOptionalNativeModule.mockImplementation((name: string) =>
      name === 'ExpoAppMetrics' || name === 'ExpoObserve' ? {} : null,
    );

    const gate = require('./mobile-observe') as typeof import('./mobile-observe');

    gate.Observe.configure({ integrations: { 'expo-router': {} } });
    expect(mockConfigure).toHaveBeenCalledWith({ integrations: { 'expo-router': {} } });
  });
});
