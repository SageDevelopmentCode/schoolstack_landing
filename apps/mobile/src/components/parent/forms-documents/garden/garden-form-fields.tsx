import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OVERDUE_INK } from '@/components/parent/forms-documents/garden/forms-garden-ui';
import { GardenSignatureField } from '@/components/parent/forms-documents/garden/garden-signature-field';
import {
  GCheckRow,
  GChoiceChips,
  GDateField,
  GTextField,
} from '@/components/parent/garden/fields';
import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GDashedRule } from '@/components/parent/garden/ui';
import type { TeacherFormField } from '@/lib/parent/parent-forms-documents-types';
import { parseStoredSignerName } from '@/lib/parent/parent-forms-documents-utils';

export type FormFieldValue = string | boolean | string[];

type GardenFormFieldsProps = {
  fields: TeacherFormField[];
  values: Record<string, FormFieldValue>;
  onChange: (fieldId: string, value: FormFieldValue) => void;
  disabled?: boolean;
  storedResponses?: Record<string, unknown> | null;
  /** Field ids to flag as missing (after the parent tried to sign). */
  invalidIds?: ReadonlySet<string>;
  onSignatureFocus?: () => void;
};

const REQUIRED_MESSAGE = "This one's required.";

function readStoredFieldValues(
  storedResponses?: Record<string, unknown> | null,
): Record<string, FormFieldValue> {
  const fields = storedResponses?.fields;
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return {};
  }
  return fields as Record<string, FormFieldValue>;
}

function displayValue(value: FormFieldValue | undefined): string {
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const text = String(value ?? '').trim();
  return text || '—';
}

function MissingNote() {
  return (
    <View style={styles.missing} accessibilityLiveRegion="polite">
      <Ionicons name="alert-circle" size={14} color={OVERDUE_INK} />
      <Text style={styles.missingText}>{REQUIRED_MESSAGE}</Text>
    </View>
  );
}

/**
 * Builder-form questions in Garden (short / long text, date, single choice,
 * checkbox, typed signature). Same values as the Story fields: multiple choice
 * is single-select stored as `[option]`. Read-only shows the stored answers as
 * notebook rows.
 */
export function GardenFormFields({
  fields,
  values,
  onChange,
  disabled = false,
  storedResponses,
  invalidIds,
  onSignatureFocus,
}: GardenFormFieldsProps) {
  const stored = readStoredFieldValues(storedResponses);

  if (disabled) {
    return (
      <View style={styles.notebook}>
        {fields.map((field, index) => {
          const value =
            field.type === 'signature'
              ? (values[field.id] ?? stored[field.id] ?? parseStoredSignerName(storedResponses))
              : (values[field.id] ?? stored[field.id]);
          return (
            <Fragment key={field.id}>
              {index > 0 ? <GDashedRule /> : null}
              <View
                style={styles.readRow}
                accessible
                accessibilityLabel={`${field.label}: ${displayValue(value)}`}>
                <Text style={styles.readLabel}>{field.label}</Text>
                <Text style={styles.readValue}>{displayValue(value)}</Text>
              </View>
            </Fragment>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {fields.map((field) => {
        const value = values[field.id] ?? stored[field.id];
        const missing = Boolean(invalidIds?.has(field.id));
        const optional = !field.required;

        if (field.type === 'signature') {
          const signatureValue =
            typeof value === 'string' ? value : parseStoredSignerName(storedResponses ?? null);
          return (
            <GardenSignatureField
              key={field.id}
              value={signatureValue}
              onChange={(next) => onChange(field.id, next)}
              onFocus={onSignatureFocus}
              label={field.label}
              invalid={missing}
            />
          );
        }

        if (field.type === 'checkbox') {
          return (
            <View key={field.id}>
              <GCheckRow
                label={field.label}
                meta={field.required ? 'Required' : 'Optional'}
                checked={value === true}
                onToggle={() => onChange(field.id, value !== true)}
              />
              {missing ? <MissingNote /> : null}
            </View>
          );
        }

        if (field.type === 'multiple_choice') {
          const selected = Array.isArray(value) ? (value[0] ?? null) : null;
          return (
            <View key={field.id} style={styles.choice}>
              <Text style={styles.choiceLabel}>
                {field.label}
                {optional ? <Text style={styles.optional}> · optional</Text> : null}
              </Text>
              <GChoiceChips
                options={(field.options ?? []).map((option) => ({ id: option, label: option }))}
                value={selected}
                onChange={(option) => onChange(field.id, [option])}
                layout="stack"
              />
              {missing ? <MissingNote /> : null}
            </View>
          );
        }

        if (field.type === 'date') {
          return (
            <View key={field.id}>
              <GDateField
                label={field.label}
                value={typeof value === 'string' ? value : ''}
                onChange={(next) => onChange(field.id, next)}
                optional={optional}
                clearable={optional}
              />
              {missing ? <MissingNote /> : null}
            </View>
          );
        }

        const long = field.type === 'long_text';
        return (
          <GTextField
            key={field.id}
            label={field.label}
            value={typeof value === 'string' ? value : ''}
            onChangeText={(next) => onChange(field.id, next)}
            optional={optional}
            multiline={long}
            numberOfLines={long ? 4 : undefined}
            error={missing ? REQUIRED_MESSAGE : null}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 18 },
  choice: { gap: 8 },
  choiceLabel: { fontFamily: GardenFonts.bodyExtra, fontSize: 14, color: Garden.ink },
  optional: { fontFamily: GardenFonts.bodySemi, fontSize: 13, color: Garden.soft },
  missing: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  missingText: { fontFamily: GardenFonts.bodyBold, fontSize: 13, color: OVERDUE_INK },
  notebook: {
    backgroundColor: Garden.notebook,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Garden.ink10,
    paddingHorizontal: 14,
  },
  readRow: { paddingVertical: 12, gap: 4 },
  readLabel: {
    fontFamily: GardenFonts.bodyExtra,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Garden.soft,
  },
  readValue: { fontFamily: GardenFonts.bodyBold, fontSize: 15, lineHeight: 21, color: Garden.ink },
});
