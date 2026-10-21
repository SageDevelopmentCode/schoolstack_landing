import { goBackOrReplace } from '@/lib/navigation';

describe('goBackOrReplace', () => {
  it('calls back when history exists', () => {
    const router = {
      canGoBack: jest.fn().mockReturnValue(true),
      back: jest.fn(),
      replace: jest.fn(),
    };

    goBackOrReplace(router, '/');

    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('replaces when there is no history', () => {
    const router = {
      canGoBack: jest.fn().mockReturnValue(false),
      back: jest.fn(),
      replace: jest.fn(),
    };

    goBackOrReplace(router, '/');

    expect(router.back).not.toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});
