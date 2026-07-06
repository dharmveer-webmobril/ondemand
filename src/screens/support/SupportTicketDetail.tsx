import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Container, AppHeader, CustomText, VectoreIcons } from '@components/common';
import { useThemeContext } from '@utils/theme';
import { PROFILE_SHARE_HOST } from '@services/api/axiosInstance';
import {
  useGetSupportTicketDetail,
  getSupportTicketDisplayId,
  getSupportTicketReportTypeName,
} from '@services/api/queries/supportTicketQueries';
import {
  SUPPORT_TICKET_STATUS_ORDER,
  formatSupportTicketDate,
  getStatusStepIndex,
  getSupportPriorityLabelKey,
  getSupportStatusLabelKey,
  supportPriorityStyle,
  supportStatusStyle,
} from '@utils/supportTicketLabels';

type RouteParams = { ticketId: string };

function resolveAttachmentUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${PROFILE_SHARE_HOST}${url.startsWith('/') ? '' : '/'}${url}`;
}

function MetaRow({
  icon,
  label,
  children,
  styles,
  theme,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
  theme: any;
}) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaLabelWrap}>
        <VectoreIcons
          name={icon}
          icon="Ionicons"
          size={theme.SF(16)}
          color={theme.colors.lightText || '#6b7280'}
        />
        <CustomText style={styles.metaLabel}>{label}</CustomText>
      </View>
      <View style={styles.metaValueWrap}>{children}</View>
    </View>
  );
}

export default function SupportTicketDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const ticketId = (route.params as RouteParams)?.ticketId;
  const { data: ticket, isLoading, isError } = useGetSupportTicketDetail(ticketId);

  const currentStep = getStatusStepIndex(ticket?.status);
  const statusStyle = supportStatusStyle(ticket?.status, theme);
  const priorityStyle = supportPriorityStyle(ticket?.priority);

  const reportTypeName = useMemo(() => {
    if (!ticket) return '';
    const name = getSupportTicketReportTypeName(ticket);
    if (name && name !== '—') return name;
    if (ticket.isOtherReportType) return t('supportTickets.otherReportType');
    return t('supportTickets.generalType');
  }, [ticket, t]);

  const attachments = useMemo(() => {
    const raw = ticket?.attachments;
    if (!Array.isArray(raw)) return [] as string[];
    return raw
      .map(item => {
        if (typeof item === 'string') return resolveAttachmentUrl(item);
        return resolveAttachmentUrl(item.url || '');
      })
      .filter(Boolean);
  }, [ticket?.attachments]);

  return (
    <Container safeArea style={styles.container}>
      <AppHeader
        title={t('supportTickets.ticketDetail')}
        onLeftPress={() => navigation.goBack()}
        containerStyle={styles.headerContainer}
      />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isError || !ticket ? (
        <View style={styles.centered}>
          <CustomText style={styles.emptyText}>
            {t('supportTickets.ticketNotFound')}
          </CustomText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.ticketIdBadge}>
                <CustomText style={styles.ticketIdText}>
                  {getSupportTicketDisplayId(ticket)}
                </CustomText>
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: priorityStyle.bg },
                ]}
              >
                <CustomText
                  style={[styles.priorityBadgeText, { color: priorityStyle.color }]}
                >
                  {t(getSupportPriorityLabelKey(ticket.priority))}
                </CustomText>
              </View>
            </View>
            <CustomText style={styles.heroTitle}>{ticket.title}</CustomText>
            <View style={styles.heroDateRow}>
              <VectoreIcons
                name="time-outline"
                icon="Ionicons"
                size={theme.SF(15)}
                color={theme.colors.lightText || '#6b7280'}
              />
              <CustomText style={styles.heroDate}>
                {formatSupportTicketDate(ticket.createdAt)}
              </CustomText>
            </View>
          </View>

          <View style={styles.card}>
            <CustomText style={styles.cardTitle}>
              {t('supportTickets.statusProgress')}
            </CustomText>
            {SUPPORT_TICKET_STATUS_ORDER.map((step, index) => {
              const done = index <= currentStep;
              const active = index === currentStep;
              const isLast = index === SUPPORT_TICKET_STATUS_ORDER.length - 1;
              return (
                <View key={step} style={styles.timelineRow}>
                  <View style={styles.timelineRail}>
                    <View
                      style={[
                        styles.timelineDot,
                        done && styles.timelineDotDone,
                        active && styles.timelineDotActive,
                      ]}
                    >
                      {done && !active ? (
                        <VectoreIcons
                          name="checkmark"
                          icon="Ionicons"
                          size={theme.SF(12)}
                          color={theme.colors.primary}
                        />
                      ) : (
                        <CustomText
                          style={[
                            styles.timelineDotText,
                            active && styles.timelineDotTextActive,
                          ]}
                        >
                          {index + 1}
                        </CustomText>
                      )}
                    </View>
                    {!isLast ? (
                      <View
                        style={[
                          styles.timelineLine,
                          index < currentStep && styles.timelineLineDone,
                        ]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.timelineBody}>
                    <CustomText
                      style={[
                        styles.timelineLabel,
                        active && styles.timelineLabelActive,
                        done && styles.timelineLabelDone,
                      ]}
                    >
                      {t(`supportTickets.status.${step}`)}
                    </CustomText>
                    {active ? (
                      <CustomText style={styles.timelineHint}>
                        {t('supportTickets.currentStep')}
                      </CustomText>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.card}>
            <CustomText style={styles.cardTitle}>
              {t('supportTickets.ticketInfo')}
            </CustomText>
            <MetaRow
              icon="flag-outline"
              label={t('supportTickets.fieldStatus')}
              styles={styles}
              theme={theme}
            >
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: statusStyle.bg,
                    borderColor: statusStyle.border,
                  },
                ]}
              >
                <CustomText style={[styles.badgeText, { color: statusStyle.color }]}>
                  {t(getSupportStatusLabelKey(ticket.status))}
                </CustomText>
              </View>
            </MetaRow>
            <View style={styles.metaDivider} />
            <MetaRow
              icon="alert-circle-outline"
              label={t('supportTickets.fieldPriority')}
              styles={styles}
              theme={theme}
            >
              <View style={[styles.badge, { backgroundColor: priorityStyle.bg }]}>
                <CustomText style={[styles.badgeText, { color: priorityStyle.color }]}>
                  {t(getSupportPriorityLabelKey(ticket.priority))}
                </CustomText>
              </View>
            </MetaRow>
            <View style={styles.metaDivider} />
            <MetaRow
              icon="folder-open-outline"
              label={t('supportTickets.fieldReportType')}
              styles={styles}
              theme={theme}
            >
              <CustomText style={styles.metaValueText}>{reportTypeName}</CustomText>
            </MetaRow>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <VectoreIcons
                name="document-text-outline"
                icon="Ionicons"
                size={theme.SF(18)}
                color={theme.colors.primary}
              />
              <CustomText style={[styles.cardTitle, styles.sectionTitle]}>
                {t('supportTickets.description')}
              </CustomText>
            </View>
            <CustomText style={styles.descriptionText}>
              {ticket.description?.trim() || t('supportTickets.noDescription')}
            </CustomText>
          </View>

          {ticket.adminComment ? (
            <View style={[styles.card, styles.adminCard]}>
              <View style={styles.sectionHeader}>
                <VectoreIcons
                  name="chatbubble-ellipses-outline"
                  icon="Ionicons"
                  size={theme.SF(18)}
                  color={theme.colors.primary}
                />
                <CustomText style={[styles.cardTitle, styles.sectionTitle]}>
                  {t('supportTickets.adminResponse')}
                </CustomText>
              </View>
              <CustomText style={styles.descriptionText}>
                {ticket.adminComment}
              </CustomText>
            </View>
          ) : null}

          {attachments.length > 0 ? (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <VectoreIcons
                  name="attach-outline"
                  icon="Ionicons"
                  size={theme.SF(18)}
                  color={theme.colors.primary}
                />
                <CustomText style={[styles.cardTitle, styles.sectionTitle]}>
                  {t('supportTickets.attachments')}
                </CustomText>
              </View>
              {attachments.map((url, idx) => (
                <TouchableOpacity
                  key={`${url}-${idx}`}
                  style={[
                    styles.attachmentRow,
                    idx === attachments.length - 1 && styles.attachmentRowLast,
                  ]}
                  onPress={() => Linking.openURL(url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.attachmentIconWrap}>
                    <VectoreIcons
                      name="document-outline"
                      icon="Ionicons"
                      size={theme.SF(20)}
                      color={theme.colors.primary}
                    />
                  </View>
                  <CustomText style={styles.attachmentText} numberOfLines={1}>
                    {t('supportTickets.attachmentN', { n: idx + 1 })}
                  </CustomText>
                  <VectoreIcons
                    name="open-outline"
                    icon="Ionicons"
                    size={theme.SF(16)}
                    color={theme.colors.lightText || '#9ca3af'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </Container>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background || '#F3F4F6',
    },
    headerContainer: {
      paddingHorizontal: theme.SW(20),
      backgroundColor: theme.colors.white,
    },
    content: {
      padding: theme.SW(16),
      paddingBottom: theme.SH(40),
      gap: theme.SH(14),
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.SW(24),
    },
    emptyText: {
      color: theme.colors.lightText || '#6b7280',
      fontFamily: theme.fonts.REGULAR,
    },
    heroCard: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg || 14,
      padding: theme.SW(18),
      borderWidth: 1,
      borderColor: `${theme.colors.text}08`,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
      }),
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.SH(12),
    },
    ticketIdBadge: {
      backgroundColor: `${theme.colors.primary}12`,
      paddingHorizontal: theme.SW(12),
      paddingVertical: theme.SH(6),
      borderRadius: 8,
    },
    ticketIdText: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.BOLD,
      color: theme.colors.primary,
    },
    priorityBadge: {
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(5),
      borderRadius: 999,
    },
    priorityBadgeText: {
      fontSize: theme.SF(11),
      fontFamily: theme.fonts.SEMI_BOLD,
      textTransform: 'uppercase',
    },
    heroTitle: {
      fontSize: theme.SF(18),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      lineHeight: theme.SF(24),
      marginBottom: theme.SH(10),
    },
    heroDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(6),
    },
    heroDate: {
      fontSize: theme.SF(13),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText || '#6b7280',
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.borderRadius.lg || 14,
      padding: theme.SW(16),
      borderWidth: 1,
      borderColor: `${theme.colors.text}08`,
    },
    adminCard: {
      backgroundColor: `${theme.colors.primary}06`,
      borderColor: `${theme.colors.primary}20`,
    },
    cardTitle: {
      fontSize: theme.SF(15),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      marginBottom: theme.SH(14),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(8),
      marginBottom: theme.SH(12),
    },
    sectionTitle: {
      marginBottom: 0,
    },
    timelineRow: {
      flexDirection: 'row',
      minHeight: theme.SH(52),
    },
    timelineRail: {
      width: theme.SW(32),
      alignItems: 'center',
    },
    timelineDot: {
      width: theme.SF(28),
      height: theme.SF(28),
      borderRadius: theme.SF(14),
      borderWidth: 2,
      borderColor: '#e5e7eb',
      backgroundColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineDotDone: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}10`,
    },
    timelineDotActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    timelineDotText: {
      fontSize: theme.SF(12),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: '#9ca3af',
    },
    timelineDotTextActive: {
      color: theme.colors.white,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: '#e5e7eb',
      marginVertical: theme.SH(4),
    },
    timelineLineDone: {
      backgroundColor: theme.colors.primary,
    },
    timelineBody: {
      flex: 1,
      paddingLeft: theme.SW(10),
      paddingBottom: theme.SH(14),
      justifyContent: 'center',
    },
    timelineLabel: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.MEDIUM,
      color: '#9ca3af',
    },
    timelineLabelDone: {
      color: theme.colors.text,
    },
    timelineLabelActive: {
      color: theme.colors.primary,
      fontFamily: theme.fonts.SEMI_BOLD,
    },
    timelineHint: {
      marginTop: theme.SH(2),
      fontSize: theme.SF(12),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText || '#6b7280',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.SH(10),
    },
    metaLabelWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(8),
      flex: 1,
    },
    metaLabel: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.lightText || '#6b7280',
    },
    metaValueWrap: {
      flexShrink: 1,
      alignItems: 'flex-end',
      maxWidth: '55%',
    },
    metaValueText: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.SEMI_BOLD,
      color: theme.colors.text,
      textAlign: 'right',
    },
    metaDivider: {
      height: 1,
      backgroundColor: `${theme.colors.text}10`,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: theme.SW(12),
      paddingVertical: theme.SH(5),
      borderWidth: 1,
      borderColor: 'transparent',
    },
    badgeText: {
      fontSize: theme.SF(12),
      fontFamily: theme.fonts.SEMI_BOLD,
    },
    descriptionText: {
      fontSize: theme.SF(14),
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
      lineHeight: theme.SF(22),
    },
    attachmentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(12),
      paddingVertical: theme.SH(12),
      borderBottomWidth: 1,
      borderBottomColor: `${theme.colors.text}10`,
    },
    attachmentRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    attachmentIconWrap: {
      width: theme.SF(40),
      height: theme.SF(40),
      borderRadius: 10,
      backgroundColor: `${theme.colors.primary}10`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attachmentText: {
      flex: 1,
      fontSize: theme.SF(14),
      color: theme.colors.text,
      fontFamily: theme.fonts.MEDIUM,
    },
  });
