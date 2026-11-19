import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import {
  useParentNewsletterDetailController,
  type ParentNewsletterDetailController,
} from '@/components/parent/newsletters/garden/use-parent-newsletter-detail-controller';

const mockReportError = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('@/lib/use-mobile-error-reporter', () => ({
  useMobileErrorReporter: () => ({ reportError: mockReportError }),
}));

jest.mock('@/lib/parent/parent-portal-api', () => ({
  getParentNewsletterDocumentWebViewSource: jest.fn(async () => ({
    uri: 'https://example.test/api/parent-portal/newsletters/edition-1/document',
    headers: { Authorization: 'Bearer token' },
  })),
}));

let controller: ParentNewsletterDetailController;

function Harness({ onController }: { onController: (c: ParentNewsletterDetailController) => void }) {
  const value = useParentNewsletterDetailController({
    organizationId: 'org-1',
    editionId: 'edition-1',
  });
  React.useEffect(() => {
    onController(value);
  });
  return null;
}

async function renderController() {
  let renderer: ReactTestRenderer | undefined;
  await act(async () => {
    renderer = create(
      <Harness
        onController={(c) => {
          controller = c;
        }}
      />,
    );
  });
  return renderer!;
}

describe('useParentNewsletterDetailController process termination', () => {
  let now = 1_000_000;

  beforeEach(() => {
    mockReportError.mockClear();
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reloads silently on the first termination', async () => {
    const renderer = await renderController();
    expect(controller.webSource).not.toBeNull();
    const initialKey = controller.webViewKey;

    act(() => controller.handleProcessTerminated({ nativeEvent: {} }));

    expect(controller.webViewKey).toBe(initialKey + 1);
    expect(controller.loadError).toBeNull();
    expect(mockReportError).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });

  it('reports a crash loop when the process dies again soon after the reload', async () => {
    const renderer = await renderController();

    act(() => controller.handleProcessTerminated({ nativeEvent: {} }));
    now += 5_000;
    act(() => controller.handleProcessTerminated({ nativeEvent: { didCrash: true } }));

    expect(mockReportError).toHaveBeenCalledTimes(1);
    expect(mockReportError).toHaveBeenCalledWith(
      'parent_newsletter_detail_render_process_gone',
      expect.any(Error),
      expect.objectContaining({
        entityType: 'newsletter_edition',
        entityId: 'edition-1',
        metadata: expect.objectContaining({ autoReloaded: true, didCrash: true }),
      }),
    );
    expect(controller.loadError).toBe('This newsletter could not be loaded.');
    act(() => renderer.unmount());
  });

  it('reloads silently again when a later background kill happens long after', async () => {
    const renderer = await renderController();
    const initialKey = controller.webViewKey;

    act(() => controller.handleProcessTerminated({ nativeEvent: {} }));
    now += 10 * 60_000;
    act(() => controller.handleProcessTerminated({ nativeEvent: {} }));

    expect(controller.webViewKey).toBe(initialKey + 2);
    expect(mockReportError).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });

  it('starts fresh after Try again', async () => {
    const renderer = await renderController();

    act(() => controller.handleProcessTerminated({ nativeEvent: {} }));
    await act(async () => {
      controller.retry();
    });
    now += 1_000;
    act(() => controller.handleProcessTerminated({ nativeEvent: {} }));

    expect(mockReportError).not.toHaveBeenCalled();
    act(() => renderer.unmount());
  });
});
