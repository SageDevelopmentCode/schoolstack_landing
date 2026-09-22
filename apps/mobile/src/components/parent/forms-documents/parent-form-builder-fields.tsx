import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ParentFormSignatureField } from '@/components/parent/forms-documents/parent-form-signature-field';
import { useParentTheme } from '@/contexts/parent-theme-context';
import { StoryFonts } from '@/constants/story-theme';
import { Spacing } from '@/constants/theme';
import type { TeacherFormField } from '@/lib/parent/parent-forms-documents-types';
import { parseStoredSignerName } from '@/lib/parent/parent-forms-documents-utils';

type ParentFormBuilderFieldsProps = {
  fields: TeacherFormField[];
  values: Record<string, string | boolean | string[]>;
  onChange: (fieldId: string, value: string | boolean | string[]) => void;
  disabled?: boolean;
  storedResponses?: Record<string, unknown> | null;
};

function readStoredFieldValues(
  storedResponses?: Record<string, unknown> | null,
): Record<string, string | boolean | string[]> {
  const fields = storedResponses?.fields;
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return {};
  }
  return fields as Record<string, string | boolean | string[]>;
}

function FieldLabel({ label, required }: { label: string; required: boolean }) {
  const theme = useParentTheme();
  return (
    <Text style={[styles.label, { color: theme.muted }]}>
      {label}
      {required ? ' *' : ''}
    </Text>
  );
}

export function ParentFormBuilderFields({
  fields,
  values,
  onChange,
  disabled = false,
  storedResponses,
}: ParentFormBuilderFieldsProps) {
  const theme = useParentTheme();
  const storedFieldValues = readStoredFieldValues(storedResponses);

  return (
    <View style={styles.container}>
      {fields.map((field) => {
        const value = values[field.id] ?? storedFieldValues[field.id];

        if (field.type === 'signature') {
          const signatureValue =
            typeof value === 'string' ? value : parseStoredSignerName(storedResponses ?? null);
          return (
            <ParentFormSignatureField
              key={field.id}
              value={signatureValue}
              onChange={(next) => onChange(field.id, next)}
              disabled={disabled}
              label={field.label}
            />
          );
        }

        if (disabled) {
          const displayValue = Array.isArray(value)
            ? value.join(', ')
            : typeof value === 'boolean'
              ? value
                ? 'Yes'
                : 'No'
              : String(value ?? '—');
          return (
            <View key={field.id} style={styles.field}>
              <FieldLabel label={field.label} required={field.required} />
              <Text style={[styles.readOnlyValue, { color: theme.ink }]}>{displayValue}</Text>
            </View>
          );
        }

        if (field.type === 'long_text') {
          return (
            <View key={field.id} style={styles.field}>
              <FieldLabel label={field.label} required={field.required} />
              <TextInput
                value={typeof value === 'string' ? value : ''}
                onChangeText={(next) => onChange(field.id, next)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[
                  styles.textArea,
                  { borderColor: theme.line, backgroundColor: theme.white, color: theme.ink },
                ]}
              />
            </View>
          );
        }

        if (field.type === 'checkbox') {
          return (
            <Pressable
              key={field.id}
              onPress={() => onChange(field.id, value !== true)}
              style={styles.checkboxRow}>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: theme.line,
                    backgroundColor: value === true ? theme.primary : theme.white,
                  },
                ]}
              />
              <FieldLabel label={field.label} required={field.required} />
            </Pressable>
          );
        }

        if (field.type === 'multiple_choice') {
          const selected = Array.isArray(value) ? value : [];
          return (
            <View key={field.id} style={styles.field}>
              <FieldLabel label={field.label} required={field.required} />
              <View style={styles.choiceList}>
                {(field.options ?? []).map((option) => {
                  const isSelected = selected.includes(option);
                  return (
                    <Pressable
                      key={option}
                      onPress={() => onChange(field.id, [option])}
                      style={[
                        styles.choice,
                        {
                          borderColor: isSelected ? theme.primary : theme.line,
                          backgroundColor: isSelected ? theme.primarySoft : theme.white,
                        },
                      ]}>
                      <Text style={{ color: theme.ink }}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        }

        return (
          <View key={field.id} style={styles.field}>
            <FieldLabel label={field.label} required={field.required} />
            <TextInput
              value={typeof value === 'string' ? value : ''}
              onChangeText={(next) => onChange(field.id, next)}
              style={[
                styles.input,
                { borderColor: theme.line, backgroundColor: theme.white, color: theme.ink },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    fontFamily: StoryFonts.body,
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: StoryFonts.body,
    fontSize: 14,
  },
  readOnlyValue: {
    fontFamily: StoryFonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
  },
  choiceList: {
    gap: Spacing.two,
  },
  choice: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
