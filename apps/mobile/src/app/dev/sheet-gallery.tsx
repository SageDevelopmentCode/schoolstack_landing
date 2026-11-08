import { Redirect, useLocalSearchParams } from 'expo-router';

import { isSheetGalleryCase, SheetGalleryScreen } from '@/components/dev/sheet-gallery-screen';
import { isMobileE2e } from '@/lib/e2e';

export default function SheetGalleryPage() {
  const { case: caseParam } = useLocalSearchParams<{ case?: string }>();

  if (!__DEV__ && !isMobileE2e) {
    return <Redirect href="/" />;
  }

  return <SheetGalleryScreen initialCase={isSheetGalleryCase(caseParam) ? caseParam : null} />;
}
