import type { ReactElement } from 'react';
import type TestRendererType from 'react-test-renderer';

type WrapperModule = typeof import('@/components/native/date-time-picker');
type FieldsModule = typeof import('@/components/parent/garden/fields');

let mockPickerLoadCount = 0;

jest.mock('@react-native-community/datetimepicker', () => {
  mockPickerLoadCount += 1;
  const { View } = jest.requireActual('react-native');
  return { __esModule: true, default: (props: object) => <View testID="native-picker" {...props} /> };
});

// Same Reanimated stand-in as the Garden screen tests (the Garden kit animates on mount).
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const builder = (): Record<string, unknown> => {
    const chain: Record<string, unknown> = {};
    for (const key of ['delay', 'duration', 'easing', 'springify', 'reduceMotion']) {
      chain[key] = () => chain;
    }
    return chain;
  };
  const identity = (value: unknown) => value;
  const base: Record<string | symbol, unknown> = {
    __esModule: true,
    default: { View, createAnimatedComponent: (Component: typeof View) => Component },
    Easing: {
      bezier: () => identity,
      in: identity,
      out: identity,
      inOut: identity,
      cubic: identity,
      linear: identity,
    },
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never' },
    useReducedMotion: () => false,
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (factory: () => Record<string, unknown>) => factory(),
    runOnJS: identity,
    withRepeat: identity,
    withTiming: identity,
    withSpring: identity,
    withDelay: (_delay: number, value: unknown) => value,
    withSequence: (...values: unknown[]) => values[0],
  };
  return new Proxy(base, {
    get: (target, key) =>
      key in target ? target[key] : typeof key === 'string' && /^[A-Z]/.test(key) ? builder() : undefined,
  });
});

jest.mock('@/contexts/parent-theme-context', () => ({
  useParentTheme: () => ({ primary: '#7A5C3E', primaryDark: '#5C4A3A' }),
}));

type Loaded = {
  wrapper: WrapperModule;
  fields: FieldsModule;
  render: (element: ReactElement) => TestRendererType.ReactTestRenderer;
  act: (callback: () => void) => void;
};

/**
 * Loads the wrapper (and optionally the Garden fields) in a fresh module registry,
 * with the native side of the picker present or missing for the given platform.
 */
function loadWithNativePicker(
  os: 'android' | 'ios',
  installed: boolean,
): Loaded {
  let loaded!: Loaded;
  jest.isolateModules(() => {
    const RN = require('react-native');
    RN.Platform.OS = os;
    jest.spyOn(RN.TurboModuleRegistry, 'get').mockImplementation((name: unknown) =>
      name === 'RNCDatePicker' && installed ? {} : null,
    );
    // Render with this registry's React so hooks and the renderer share one copy.
    const { act } = require('react');
    const TestRenderer: typeof TestRendererType = require('react-test-renderer');
    loaded = {
      wrapper: require('@/components/native/date-time-picker'),
      fields: require('@/components/parent/garden/fields'),
      act,
      render: (element) => {
        let renderer!: TestRendererType.ReactTestRenderer;
        act(() => {
          renderer = TestRenderer.create(element);
        });
        return renderer;
      },
    };
  });
  return loaded;
}

describe('DateTimePicker wrapper', () => {
  beforeEach(() => {
    mockPickerLoadCount = 0;
  });

  it('does not load the package on Android builds without the native picker', () => {
    const { wrapper } = loadWithNativePicker('android', false);

    expect(wrapper.isDateTimePickerAvailable).toBe(false);
    expect(mockPickerLoadCount).toBe(0);
  });

  it.each(['android', 'ios'] as const)('loads the native picker on %s when it is installed', (os) => {
    const { wrapper, render } = loadWithNativePicker(os, true);

    expect(wrapper.isDateTimePickerAvailable).toBe(true);
    expect(mockPickerLoadCount).toBe(1);

    const tree = render(
      <wrapper.DateTimePicker value={new Date(2026, 10, 19)} mode="date" onChange={() => {}} />,
    );
    expect(tree.root.findAllByProps({ testID: 'native-picker' }).length).toBeGreaterThan(0);
  });

  it('renders the update hint instead of a picker when the native module is missing', () => {
    const { wrapper, render } = loadWithNativePicker('android', false);

    const tree = render(
      <wrapper.DateTimePicker value={new Date(2026, 10, 19)} mode="date" onChange={() => {}} />,
    );

    expect(tree.root.findAllByProps({ testID: 'native-picker' })).toHaveLength(0);
    expect(JSON.stringify(tree.toJSON())).toContain(wrapper.DATE_PICKER_UNAVAILABLE_MESSAGE);
  });

  it('keeps Garden date and time fields usable on old Android builds', () => {
    const { wrapper, fields, render, act } = loadWithNativePicker('android', false);

    const tree = render(
      <>
        <fields.GDateField label="Start date" value="2026-11-19" onChange={() => {}} />
        <fields.GTimeField label="Start time" value="08:30" onChange={() => {}} />
      </>,
    );
    const output = JSON.stringify(tree.toJSON());
    expect(output).toContain('Start date');
    expect(output).toContain('8:30');

    // Opening the date field shows the hint rather than crashing.
    const [dateButton] = tree.root.findAll(
      (node) =>
        typeof node.props?.accessibilityLabel === 'string' &&
        node.props.accessibilityLabel.startsWith('Start date') &&
        typeof node.props.onPress === 'function',
    );
    act(() => {
      dateButton.props.onPress();
    });
    expect(JSON.stringify(tree.toJSON())).toContain(wrapper.DATE_PICKER_UNAVAILABLE_MESSAGE);
    expect(mockPickerLoadCount).toBe(0);
  });
});
