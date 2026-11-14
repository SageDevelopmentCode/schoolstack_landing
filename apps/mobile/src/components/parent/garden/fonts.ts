import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { GochiHand_400Regular } from '@expo-google-fonts/gochi-hand/400Regular';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';

/**
 * Garden fonts are loaded lazily by the screens that use them (not in
 * `APP_FONTS`) so app start-up is unaffected while the Home lab is temporary.
 * Returns true once loaded, or if loading failed (system fonts are the fallback).
 */
export function useGardenFonts(): boolean {
  const [loaded, error] = useFonts({
    BricolageGrotesque_800ExtraBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    GochiHand_400Regular,
  });
  return loaded || Boolean(error);
}
