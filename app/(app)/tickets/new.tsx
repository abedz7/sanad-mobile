import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import {
  ticketKeys,
  uploadAttachment,
  useCreateTicket,
  type LocalFile,
} from '../../../src/api/tickets';
import { Button } from '../../../src/components/Button';
import { CategoryPicker } from '../../../src/components/CategoryPicker';
import { PriorityPicker } from '../../../src/components/PriorityPicker';
import { TextField } from '../../../src/components/TextField';
import { errorMessage } from '../../../src/lib/errors';
import { theme } from '../../../src/lib/theme';
import type { Category, Priority, Ticket } from '../../../src/types/api';

// Mirrors the contract (API.md §7.3 POST /tickets).
const schema = z.object({
  title: z.string().trim().min(3, 'At least 3 characters').max(120, 'At most 120 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Describe the problem')
    .max(5000, 'At most 5000 characters'),
  categoryId: z.string().min(1, 'Pick a category'),
});

type FormValues = z.infer<typeof schema>;

const MAX_PHOTOS = 5;

interface PendingPhoto {
  file: LocalFile;
  status: 'pending' | 'uploading' | 'done' | 'failed';
  progress: number;
}

export default function NewTicketScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createTicket = useCreateTicket();
  const [category, setCategory] = useState<Category | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [photoNotice, setPhotoNotice] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  // Once the ticket exists, submit retries only the failed uploads — the
  // ticket must never be created twice.
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [busy, setBusy] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', categoryId: '' },
  });

  const failedCount = photos.filter((photo) => photo.status === 'failed').length;
  const locked = createdTicket !== null;

  const addPhotos = async () => {
    setPhotoNotice(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPhotoNotice(
        'Photo access is turned off. Enable it in Settings → Sanad → Photos to attach pictures.',
      );
      return;
    }
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (result.canceled) return;
    const picked = result.assets.slice(0, remaining).map((asset, index): PendingPhoto => {
      const extension = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
      return {
        file: {
          uri: asset.uri,
          name: asset.fileName ?? `photo-${Date.now()}-${index}.${extension}`,
          type: asset.mimeType ?? 'image/jpeg',
        },
        status: 'pending',
        progress: 0,
      };
    });
    setPhotos((current) => [...current, ...picked].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, i) => i !== index));
  };

  const updatePhoto = (index: number, patch: Partial<PendingPhoto>) => {
    setPhotos((current) =>
      current.map((photo, i) => (i === index ? { ...photo, ...patch } : photo)),
    );
  };

  /** Sequential uploads keep progress legible and the server load gentle. */
  const uploadPending = async (ticketId: string, list: PendingPhoto[]): Promise<number> => {
    let failures = 0;
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].status === 'done') continue;
      updatePhoto(i, { status: 'uploading', progress: 0 });
      try {
        await uploadAttachment(ticketId, list[i].file, (fraction) =>
          updatePhoto(i, { progress: fraction }),
        );
        updatePhoto(i, { status: 'done', progress: 1 });
      } catch {
        failures += 1;
        updatePhoto(i, { status: 'failed' });
      }
    }
    return failures;
  };

  const finishSubmit = async (ticket: Ticket, list: PendingPhoto[]) => {
    const failures = await uploadPending(ticket.id, list);
    setBusy(false);
    // The ticket in cache came from the create response (no attachments yet);
    // the uploads just changed it server-side, so refetch before the detail
    // screen reads it, or its Attachments section would show nothing.
    if (list.length > 0) {
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.history(ticket.id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    }
    if (failures === 0) {
      router.replace(`/(app)/tickets/${ticket.id}`);
    } else {
      setServerError(
        `Ticket created, but ${failures} of ${list.length} photo${list.length === 1 ? '' : 's'} failed to upload.`,
      );
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setBusy(true);
    try {
      const ticket = await createTicket.mutateAsync({
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        priority,
      });
      setCreatedTicket(ticket);
      await finishSubmit(ticket, photos);
    } catch (error) {
      setBusy(false);
      setServerError(errorMessage(error));
    }
  });

  const retryFailed = async () => {
    if (!createdTicket) return;
    setServerError(null);
    setBusy(true);
    await finishSubmit(createdTicket, photos);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Title"
              editable={!locked}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.title?.message}
            />
          )}
        />

        <CategoryPicker
          error={errors.categoryId?.message}
          onChange={(selected) => {
            if (locked) return;
            setCategory(selected);
            setValue('categoryId', selected.id, { shouldValidate: true });
          }}
          value={category}
        />

        <PriorityPicker onChange={locked ? () => {} : setPriority} value={priority} />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Description"
              editable={!locked}
              multiline
              numberOfLines={6}
              style={styles.description}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.description?.message}
            />
          )}
        />

        <View style={styles.photosSection}>
          <Text style={styles.photosLabel}>
            Photos ({photos.length}/{MAX_PHOTOS})
          </Text>
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={photo.file.uri} style={styles.thumbWrapper}>
                <Image
                  accessibilityIgnoresInvertColors
                  source={{ uri: photo.file.uri }}
                  style={[styles.thumb, photo.status === 'failed' && styles.thumbFailed]}
                />
                {photo.status === 'uploading' ? (
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${photo.progress * 100}%` }]}
                    />
                  </View>
                ) : null}
                {photo.status === 'done' ? (
                  <Ionicons
                    color={theme.accent}
                    name="checkmark-circle"
                    size={20}
                    style={styles.thumbStatus}
                  />
                ) : photo.status === 'failed' ? (
                  <Ionicons
                    color={theme.danger}
                    name="alert-circle"
                    size={20}
                    style={styles.thumbStatus}
                  />
                ) : (
                  <Pressable
                    accessibilityLabel="Remove photo"
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => removePhoto(index)}
                    style={styles.thumbRemove}
                  >
                    <Ionicons color="#ffffff" name="close" size={14} />
                  </Pressable>
                )}
              </View>
            ))}
            {photos.length < MAX_PHOTOS && !locked ? (
              <Pressable
                accessibilityLabel="Add photos"
                accessibilityRole="button"
                disabled={busy}
                onPress={addPhotos}
                style={styles.addPhoto}
              >
                <Ionicons color={theme.accent} name="images-outline" size={22} />
                <Text style={styles.addPhotoText}>Add photos</Text>
              </Pressable>
            ) : null}
          </View>
          {photoNotice ? <Text style={styles.photoNotice}>{photoNotice}</Text> : null}
        </View>

        {serverError ? (
          <View accessibilityRole="alert" style={styles.serverError}>
            <Text style={styles.serverErrorText}>{serverError}</Text>
          </View>
        ) : null}

        {locked && failedCount > 0 && !busy ? (
          <View style={styles.row}>
            <View style={styles.flexGrow}>
              <Button onPress={retryFailed} title={`Retry ${failedCount} failed`} />
            </View>
            <View style={styles.flexGrow}>
              <Button
                onPress={() => router.replace(`/(app)/tickets/${createdTicket.id}`)}
                title="Continue to ticket"
              />
            </View>
          </View>
        ) : (
          <Button
            loading={busy}
            onPress={locked ? retryFailed : onSubmit}
            title="Create ticket"
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  addPhoto: {
    alignItems: 'center',
    borderColor: theme.accent,
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 4,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  addPhotoText: {
    color: theme.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  container: {
    gap: 16,
    padding: 20,
  },
  description: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  flex: {
    backgroundColor: theme.background,
    flex: 1,
  },
  flexGrow: {
    flex: 1,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoNotice: {
    color: theme.textMuted,
    fontSize: 13,
  },
  photosLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  photosSection: {
    gap: 8,
  },
  progressFill: {
    backgroundColor: theme.accent,
    borderRadius: 2,
    height: 4,
  },
  progressTrack: {
    backgroundColor: theme.border,
    borderRadius: 2,
    bottom: 6,
    height: 4,
    left: 6,
    position: 'absolute',
    right: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  serverError: {
    backgroundColor: theme.dangerTint,
    borderRadius: 10,
    padding: 12,
  },
  serverErrorText: {
    color: theme.danger,
    fontSize: 14,
  },
  thumb: {
    borderRadius: 10,
    height: 84,
    width: 84,
  },
  thumbFailed: {
    opacity: 0.5,
  },
  thumbRemove: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.8)',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 20,
  },
  thumbStatus: {
    position: 'absolute',
    right: 4,
    top: 4,
  },
  thumbWrapper: {
    position: 'relative',
  },
});
