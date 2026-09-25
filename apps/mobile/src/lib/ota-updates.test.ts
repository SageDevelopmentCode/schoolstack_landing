jest.mock('expo-updates', () => ({
  isEnabled: true,
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

jest.mock('@/lib/e2e', () => ({
  isMobileE2e: false,
}));

import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

import {
  checkAndPromptForOtaUpdate,
  runOtaUpdateCheck,
  shouldCheckForOtaUpdates,
} from '@/lib/ota-updates';

const mockCheckForUpdateAsync = Updates.checkForUpdateAsync as jest.MockedFunction<
  typeof Updates.checkForUpdateAsync
>;
const mockFetchUpdateAsync = Updates.fetchUpdateAsync as jest.MockedFunction<
  typeof Updates.fetchUpdateAsync
>;
const mockReloadAsync = Updates.reloadAsync as jest.MockedFunction<typeof Updates.reloadAsync>;
const mockAlert = jest.spyOn(Alert, 'alert');

describe('shouldCheckForOtaUpdates', () => {
  it('is false in Jest dev builds', () => {
    expect(shouldCheckForOtaUpdates()).toBe(false);
  });
});

describe('checkAndPromptForOtaUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockImplementation(() => {});
  });

  it('skips the network check in dev', async () => {
    await checkAndPromptForOtaUpdate();
    expect(mockCheckForUpdateAsync).not.toHaveBeenCalled();
  });
});

describe('runOtaUpdateCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockImplementation(() => {});
  });

  it('does nothing when no update is available', async () => {
    mockCheckForUpdateAsync.mockResolvedValue({ isAvailable: false } as Awaited<
      ReturnType<typeof Updates.checkForUpdateAsync>
    >);

    await runOtaUpdateCheck();

    expect(mockFetchUpdateAsync).not.toHaveBeenCalled();
    expect(mockAlert).not.toHaveBeenCalled();
  });

  it('fetches and prompts when an update is available', async () => {
    mockCheckForUpdateAsync.mockResolvedValue({ isAvailable: true } as Awaited<
      ReturnType<typeof Updates.checkForUpdateAsync>
    >);
    mockFetchUpdateAsync.mockResolvedValue({} as Awaited<ReturnType<typeof Updates.fetchUpdateAsync>>);

    await runOtaUpdateCheck();

    expect(mockFetchUpdateAsync).toHaveBeenCalled();
    expect(mockAlert).toHaveBeenCalledWith(
      'Update available',
      expect.stringContaining('Restart the app'),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Later' }),
        expect.objectContaining({ text: 'Restart now' }),
      ]),
    );
  });

  it('reloads when the user chooses Restart now', async () => {
    mockCheckForUpdateAsync.mockResolvedValue({ isAvailable: true } as Awaited<
      ReturnType<typeof Updates.checkForUpdateAsync>
    >);
    mockFetchUpdateAsync.mockResolvedValue({} as Awaited<ReturnType<typeof Updates.fetchUpdateAsync>>);
    mockAlert.mockImplementation((_title, _message, buttons) => {
      const restart = buttons?.find((button) => button.text === 'Restart now');
      restart?.onPress?.();
    });

    await runOtaUpdateCheck();

    expect(mockReloadAsync).toHaveBeenCalled();
  });
});
