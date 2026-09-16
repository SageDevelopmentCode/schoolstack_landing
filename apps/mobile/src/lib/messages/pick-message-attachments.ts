import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import {
  MAX_MESSAGE_ATTACHMENTS,
  MAX_MESSAGE_ATTACHMENT_BYTES,
  MESSAGE_ATTACHMENT_MIME_TYPES,
} from '@/lib/messages/constants';
import type { StagedMessageFile } from '@/lib/messages/types';

function extensionForMimeType(mimeType: string | null | undefined): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
    default:
      return 'jpg';
  }
}

function defaultPhotoFileName(mimeType: string | null | undefined, index: number): string {
  return `photo-${Date.now()}-${index + 1}.${extensionForMimeType(mimeType)}`;
}

function isAllowedMimeType(mimeType: string | null | undefined): boolean {
  if (!mimeType) return true;
  return MESSAGE_ATTACHMENT_MIME_TYPES.includes(
    mimeType as (typeof MESSAGE_ATTACHMENT_MIME_TYPES)[number],
  );
}

function toStagedFile(input: {
  uri: string;
  name: string;
  mimeType: string | null;
  size: number | null;
}): StagedMessageFile | null {
  if (!isAllowedMimeType(input.mimeType)) return null;
  if (input.size != null && input.size > MAX_MESSAGE_ATTACHMENT_BYTES) return null;
  return {
    uri: input.uri,
    name: input.name,
    mimeType: input.mimeType,
    size: input.size,
  };
}

export function appendStagedMessageFiles(
  existing: StagedMessageFile[],
  incoming: StagedMessageFile[],
): StagedMessageFile[] {
  const next = [...existing];
  for (const file of incoming) {
    if (next.length >= MAX_MESSAGE_ATTACHMENTS) break;
    const staged = toStagedFile(file);
    if (staged) {
      next.push(staged);
    }
  }
  return next;
}

export function remainingAttachmentSlots(currentCount: number): number {
  return Math.max(0, MAX_MESSAGE_ATTACHMENTS - currentCount);
}

export async function pickPhotosFromLibrary(
  remainingSlots: number,
): Promise<StagedMessageFile[]> {
  if (remainingSlots <= 0) return [];

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Photo access needed',
      'Allow access to your photo library to attach images to messages in MudKitchen.',
    );
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: remainingSlots > 1,
    selectionLimit: remainingSlots,
    quality: 0.85,
  });

  if (result.canceled) return [];

  return result.assets
    .slice(0, remainingSlots)
    .map((asset, index) =>
      toStagedFile({
        uri: asset.uri,
        name: asset.fileName?.trim() || defaultPhotoFileName(asset.mimeType, index),
        mimeType: asset.mimeType ?? 'image/jpeg',
        size: asset.fileSize ?? null,
      }),
    )
    .filter((file): file is StagedMessageFile => file !== null);
}

export async function pickDocumentsFromLibrary(
  remainingSlots: number,
): Promise<StagedMessageFile[]> {
  if (remainingSlots <= 0) return [];

  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
    type: [...MESSAGE_ATTACHMENT_MIME_TYPES],
  });

  if (result.canceled) return [];

  return result.assets
    .slice(0, remainingSlots)
    .map((asset) =>
      toStagedFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? null,
        size: asset.size ?? null,
      }),
    )
    .filter((file): file is StagedMessageFile => file !== null);
}

export function promptMessageAttachmentSource(
  onPick: (source: 'photos' | 'files') => void | Promise<void>,
): void {
  Alert.alert('Attach', undefined, [
    {
      text: 'Photo Library',
      onPress: () => {
        void onPick('photos');
      },
    },
    {
      text: 'Choose File',
      onPress: () => {
        void onPick('files');
      },
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
