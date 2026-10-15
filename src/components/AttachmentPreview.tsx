import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { downloadAttachment, useAttachmentFile } from '../api/tickets';
import { showToast } from './Toast';
import { theme } from '../lib/theme';
import type { Attachment } from '../types/api';

interface AttachmentPreviewProps {
  ticketId: string;
  attachment: Attachment;
}

/**
 * Image attachments: authenticated download into cache, thumbnail, tap for a
 * full-screen preview. PDFs: tappable row that downloads then opens the share
 * sheet. Nothing ever opens a raw API URL.
 */
export function AttachmentPreview({ ticketId, attachment }: AttachmentPreviewProps) {
  const isImage = attachment.mimeType.startsWith('image/');
  return isImage ? (
    <ImageThumb attachment={attachment} ticketId={ticketId} />
  ) : (
    <FileRow attachment={attachment} ticketId={ticketId} />
  );
}

function ImageThumb({ ticketId, attachment }: AttachmentPreviewProps) {
  const [preview, setPreview] = useState(false);
  const { data: uri, isPending, isError, refetch } = useAttachmentFile(ticketId, attachment);

  if (isPending) {
    return (
      <View style={styles.thumbBox}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }
  if (isError || !uri) {
    return (
      <Pressable
        accessibilityLabel={`Retry loading ${attachment.originalName}`}
        accessibilityRole="button"
        onPress={() => refetch()}
        style={styles.thumbBox}
      >
        <Ionicons color={theme.danger} name="refresh" size={20} />
      </Pressable>
    );
  }
  return (
    <>
      <Pressable
        accessibilityLabel={`View ${attachment.originalName}`}
        accessibilityRole="imagebutton"
        onPress={() => setPreview(true)}
      >
        <Image accessibilityIgnoresInvertColors source={{ uri }} style={styles.thumb} />
      </Pressable>
      <Modal
        animationType="fade"
        onRequestClose={() => setPreview(false)}
        transparent
        visible={preview}
      >
        <Pressable
          accessibilityLabel="Close preview"
          onPress={() => setPreview(false)}
          style={styles.previewBackdrop}
        >
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={{ uri }}
            style={styles.previewImage}
          />
        </Pressable>
      </Modal>
    </>
  );
}

function FileRow({ ticketId, attachment }: AttachmentPreviewProps) {
  const [downloading, setDownloading] = useState(false);

  const open = async () => {
    setDownloading(true);
    try {
      const uri = await downloadAttachment(ticketId, attachment);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: attachment.mimeType });
      } else {
        showToast('Opening files is not supported on this device.');
      }
    } catch {
      showToast('Could not download the file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Pressable
      accessibilityLabel={`Open ${attachment.originalName}`}
      accessibilityRole="button"
      disabled={downloading}
      onPress={open}
      style={({ pressed }) => [styles.fileRow, pressed && styles.fileRowPressed]}
    >
      <Ionicons color={theme.accent} name="document-outline" size={20} />
      <Text numberOfLines={1} style={styles.fileName}>
        {attachment.originalName}
      </Text>
      {downloading ? <ActivityIndicator color={theme.accent} size="small" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fileName: {
    color: theme.text,
    flexShrink: 1,
    fontSize: 14,
  },
  fileRow: {
    alignItems: 'center',
    borderColor: theme.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  fileRowPressed: {
    backgroundColor: theme.surface,
  },
  previewBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    flex: 1,
    justifyContent: 'center',
  },
  previewImage: {
    height: '90%',
    width: '100%',
  },
  thumb: {
    borderRadius: 10,
    height: 72,
    width: 72,
  },
  thumbBox: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
});
