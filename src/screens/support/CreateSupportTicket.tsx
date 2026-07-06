import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  pick,
  types,
  errorCodes,
  isErrorWithCode,
  type DocumentPickerResponse,
} from '@react-native-documents/picker';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  Container,
  AppHeader,
  CustomButton,
  CustomInput,
  CustomText,
  KeyboardFormScroll,
  VectoreIcons,
  showToast,
} from '@components';
import { useThemeContext } from '@utils/theme';
import {
  useCreateSupportTicket,
  useGetSupportReportTypes,
  getSupportReportTypeLabel,
  type SupportTicketPriority,
} from '@services/api/queries/supportTicketQueries';

const MAX_ATTACHMENTS = 2;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

type PickedAttachment = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

const PRIORITY_OPTIONS: SupportTicketPriority[] = ['low', 'medium', 'high'];

const ALLOWED_FILE_TYPES = [
  types.images,
  types.pdf,
  types.doc,
  types.docx,
  types.plainText,
];

function toAttachment(doc: DocumentPickerResponse): PickedAttachment {
  return {
    uri: doc.uri,
    name: doc.name ?? `attachment_${Date.now()}`,
    type: doc.type ?? 'application/octet-stream',
    size: doc.size ?? undefined,
  };
}

export default function CreateSupportTicket() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data: reportTypes = [], isLoading: loadingTypes } =
    useGetSupportReportTypes();
  const createMutation = useCreateSupportTicket();
console.log("reportTypes", reportTypes);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<SupportTicketPriority>('medium');
  const [reportTypeId, setReportTypeId] = useState<string | null>(null);
  const [isOtherReportType, setIsOtherReportType] = useState(false);
  const [attachments, setAttachments] = useState<PickedAttachment[]>([]);

  const reportTypeItems = useMemo(() => {
    const items = reportTypes.map(rt => ({
      label: getSupportReportTypeLabel(rt),
      value: rt._id || rt.id || '',
      isOther: Boolean(rt.isOther),
    }));
    if (!items.some(item => item.isOther)) {
      items.push({
        label: t('supportTickets.otherReportType'),
        value: '__other__',
        isOther: true,
      });
    }
    return items;
  }, [reportTypes, t]);

  const priorityItems = useMemo(
    () =>
      PRIORITY_OPTIONS.map(value => ({
        label: t(`supportTickets.priority.${value}`),
        value,
      })),
    [t],
  );

  const handlePickFiles = async () => {
    if (attachments.length >= MAX_ATTACHMENTS) {
      showToast({
        type: 'error',
        title: t('messages.error'),
        message: t('supportTickets.maxAttachments', { count: MAX_ATTACHMENTS }),
      });
      return;
    }

    try {
      const remainingSlots = MAX_ATTACHMENTS - attachments.length;
      const results = await pick({
        mode: 'import',
        allowMultiSelection: remainingSlots > 1,
        type: ALLOWED_FILE_TYPES,
      });

      const pickedFiles: PickedAttachment[] = [];

      for (const doc of results.slice(0, remainingSlots)) {
        const file = toAttachment(doc);
        if (file.size && file.size > MAX_FILE_BYTES) {
          showToast({
            type: 'error',
            title: t('messages.error'),
            message: t('supportTickets.fileTooLarge'),
          });
          continue;
        }
        pickedFiles.push(file);
      }

      if (pickedFiles.length > 0) {
        setAttachments(prev =>
          [...prev, ...pickedFiles].slice(0, MAX_ATTACHMENTS),
        );
      }
    } catch (error) {
      if (
        isErrorWithCode(error) &&
        error.code === errorCodes.OPERATION_CANCELED
      ) {
        return;
      }
      showToast({
        type: 'error',
        title: t('messages.error'),
        message: t('supportTickets.pickFileError'),
      });
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast({
        type: 'error',
        title: t('messages.error'),
        message: t('supportTickets.errors.titleRequired'),
      });
      return;
    }

    if (!description.trim()) {
      showToast({
        type: 'error',
        title: t('messages.error'),
        message: t('supportTickets.errors.descriptionRequired'),
      });
      return;
    }

    if (!isOtherReportType && !reportTypeId) {
      showToast({
        type: 'error',
        title: t('messages.error'),
        message: t('supportTickets.errors.reportTypeRequired'),
      });
      return;
    }

    try {
      const response = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        priority,
        reportTypeId: isOtherReportType ? undefined : reportTypeId || undefined,
        isOtherReportType,
        attachments,
      });

      const code = Number(response?.ResponseCode ?? 200);
      const failed =
        response?.succeeded === false || (code >= 400 && code < 600);
      if (failed) {
        throw new Error(response?.ResponseMessage);
      }

      showToast({
        type: 'success',
        title: t('messages.success'),
        message: t('supportTickets.createSuccess'),
      });
      navigation.goBack();
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('messages.error'),
        message:
          error?.response?.data?.ResponseMessage ||
          error?.message ||
          t('supportTickets.createError'),
      });
    }
  };

  return (
    <Container safeArea style={styles.container}>
      <AppHeader
        title={t('supportTickets.raiseTicket')}
        onLeftPress={() => navigation.goBack()}
      />

      <KeyboardFormScroll contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <CustomText style={styles.label}>
            {t('supportTickets.fieldTitle')} *
          </CustomText>
          <CustomInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('supportTickets.fieldTitlePlaceholder')}
            transparentBackground
            marginTop={0}
          />
        </View>

        <View style={styles.field}>
          <CustomText style={styles.label}>
            {t('supportTickets.fieldReportType')} *
          </CustomText>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelected}
            itemTextStyle={styles.dropdownItemText}
            data={reportTypeItems}
            labelField="label"
            valueField="value"
            placeholder={
              loadingTypes
                ? t('supportTickets.loading')
                : t('supportTickets.fieldReportTypePlaceholder')
            }
            value={isOtherReportType ? '__other__' : reportTypeId || undefined}
            onChange={item => {
              if (item.isOther || item.value === '__other__') {
                setIsOtherReportType(true);
                setReportTypeId(null);
              } else {
                setIsOtherReportType(false);
                setReportTypeId(item.value);
              }
            }}
          />
        </View>

        <View style={styles.field}>
          <CustomText style={styles.label}>
            {t('supportTickets.fieldPriority')}
          </CustomText>
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelected}
            itemTextStyle={styles.dropdownItemText}
            data={priorityItems}
            labelField="label"
            valueField="value"
            value={priority}
            onChange={item => setPriority(item.value)}
          />
        </View>

        <View style={styles.field}>
          <CustomText style={styles.label}>
            {t('supportTickets.fieldDescription')} *
          </CustomText>
          <CustomInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('supportTickets.fieldDescriptionPlaceholder')}
            transparentBackground
            marginTop={0}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{ height: theme.SH(120) }}
          />
        </View>

        <View style={styles.field}>
          <CustomText style={styles.label}>
            {t('supportTickets.attachmentsOptional')}
          </CustomText>
          <CustomText style={styles.hint}>
            {t('supportTickets.attachmentsHint')}
          </CustomText>

          {attachments.map((file, index) => (
            <View key={`${file.uri}-${index}`} style={styles.fileRow}>
              <CustomText style={styles.fileName} numberOfLines={1}>
                {file.name}
              </CustomText>
              <TouchableOpacity
                onPress={() =>
                  setAttachments(prev => prev.filter((_, i) => i !== index))
                }
              >
                <VectoreIcons
                  name="close-circle"
                  icon="Ionicons"
                  size={theme.SF(20)}
                  color={theme.colors.error || '#dc2626'}
                />
              </TouchableOpacity>
            </View>
          ))}

          <Pressable style={styles.uploadBtn} onPress={handlePickFiles}>
            <VectoreIcons
              name="cloud-upload-outline"
              icon="Ionicons"
              size={theme.SF(18)}
              color={theme.colors.primary}
            />
            <CustomText style={styles.uploadBtnText}>
              {t('supportTickets.uploadFiles')}
            </CustomText>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <CustomButton
            title={t('supportTickets.cancel')}
            onPress={() => navigation.goBack()}
            isBordered
            backgroundColor={theme.colors.white}
            textColor={theme.colors.primary}
            buttonStyle={styles.cancelBtn}
          />
          <CustomButton
            title={t('supportTickets.submitTicket')}
            onPress={handleSubmit}
            isLoading={createMutation.isPending}
            disable={createMutation.isPending}
            buttonStyle={styles.submitBtn}
          />
        </View>
      </KeyboardFormScroll>
    </Container>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F7F7F7',
      paddingHorizontal: theme.SW(20),
    },
    content: {
      paddingTop: theme.SH(16),
      paddingBottom: theme.SH(40),
    },
    field: {
      marginBottom: theme.SH(18),
    },
    label: {
      fontSize: theme.SF(13),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(8),
    },
    hint: {
      fontSize: theme.SF(12),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText || '#6b7280',
      marginBottom: theme.SH(10),
    },
    dropdown: {
      height: theme.SH(48),
      borderWidth: 1,
      borderColor: `${theme.colors.text}25`,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.SW(12),
      backgroundColor: theme.colors.white,
    },
    dropdownContainer: {
      borderRadius: theme.borderRadius.md,
    },
    dropdownPlaceholder: {
      fontSize: theme.SF(14),
      color: theme.colors.lightText || '#9ca3af',
    },
    dropdownSelected: {
      fontSize: theme.SF(14),
      color: theme.colors.text,
    },
    dropdownItemText: {
      fontSize: theme.SF(14),
      color: theme.colors.text,
    },
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.SH(8),
      gap: theme.SW(8),
    },
    fileName: {
      flex: 1,
      fontSize: theme.SF(13),
      color: theme.colors.text,
      fontFamily: theme.fonts.REGULAR,
    },
    uploadBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.SW(8),
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.SH(12),
      backgroundColor: theme.colors.white,
    },
    uploadBtnText: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.primary,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.SW(12),
      marginTop: theme.SH(12),
    },
    cancelBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    submitBtn: {
      flex: 1,
    },
  });
