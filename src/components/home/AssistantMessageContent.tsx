import { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomText } from '@components/common';
import { ThemeType, useThemeContext } from '@utils/theme';
import type { AiAssistantAction } from '@services/api/queries/aiAssistantQueries';
import {
  buildServiceProviderMap,
  navigateFromAssistantUrl,
  navigateToAssistantProvider,
} from '@utils/aiAssistantNavigation';

/** Remove old fallback footer from stored messages */
export function cleanAssistantText(content: string): string {
  return String(content || '')
    .replace(
      /\n\n\(Note: AI service is temporarily using basic answers[\s\S]*?\)\s*$/i,
      '',
    )
    .trim();
}

type InlinePart =
  | { kind: 'text'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'link'; label: string; href: string };

function parseInlineParts(text: string): InlinePart[] {
  const str = String(text);
  const parts: InlinePart[] = [];
  const tokenRe = /(\*\*.+?\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(str)) !== null) {
    if (match.index > last) {
      parts.push({ kind: 'text', value: str.slice(last, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push({ kind: 'bold', value: token.slice(2, -2) });
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        parts.push({ kind: 'link', label: linkMatch[1], href: linkMatch[2] });
      }
    }
    last = match.index + token.length;
  }

  if (last < str.length) {
    parts.push({ kind: 'text', value: str.slice(last) });
  }

  return parts.length ? parts : [{ kind: 'text', value: str }];
}

type Props = {
  content: string;
  isUser?: boolean;
  actions?: AiAssistantAction[];
  /** When chat is opened from a provider profile, used as fallback for service taps. */
  contextSpId?: string;
};

export default function AssistantMessageContent({
  content,
  isUser = false,
  actions = [],
  contextSpId,
}: Props) {
  const theme = useThemeContext();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const text = isUser ? String(content || '') : cleanAssistantText(content);
  const bodySize = theme.fontSize.sm;
  const actionSize = theme.fontSize.xs;

  const serviceProviderMap = useMemo(
    () => buildServiceProviderMap(actions, text),
    [actions, text],
  );

  const resolveSpIdForService = (
    serviceName: string,
    allowContextNav = false,
  ): string | null => {
    const key = serviceName.trim().toLowerCase();
    if (serviceProviderMap.has(key)) {
      return serviceProviderMap.get(key)!;
    }
    if (!allowContextNav) return null;
    if (contextSpId) return contextSpId;
    const spIds = [...new Set(serviceProviderMap.values())];
    if (spIds.length === 1) return spIds[0];
    return null;
  };

  const renderInline = (
    line: string,
    keyPrefix: string,
    allowContextNav = false,
  ) =>
    parseInlineParts(line).map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.kind === 'bold') {
        const spId = !isUser
          ? resolveSpIdForService(part.value, allowContextNav)
          : null;
        if (spId) {
          return (
            <Pressable
              key={key}
              onPress={() => navigateToAssistantProvider(spId)}
              style={({ pressed }) => [
                pressed && styles.serviceNamePressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={part.value}
            >
              <CustomText
                fontSize={bodySize}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.primary}
                style={styles.serviceName}
              >
                {part.value}
              </CustomText>
            </Pressable>
          );
        }
        return (
          <CustomText
            key={key}
            fontSize={bodySize}
            fontFamily={theme.fonts.SEMI_BOLD}
            color={isUser ? theme.colors.white : theme.colors.text}
          >
            {part.value}
          </CustomText>
        );
      }
      if (part.kind === 'link') {
        return (
          <Pressable
            key={key}
            onPress={() => navigateFromAssistantUrl(part.href)}
            style={styles.linkBtn}
          >
            <CustomText
              fontSize={actionSize}
              fontFamily={theme.fonts.SEMI_BOLD}
              color={theme.colors.white}
            >
              {part.label}
            </CustomText>
          </Pressable>
        );
      }
      return (
        <CustomText
          key={key}
          fontSize={bodySize}
          fontFamily={theme.fonts.REGULAR}
          color={isUser ? theme.colors.white : theme.colors.text}
        >
          {part.value}
        </CustomText>
      );
    });

  if (isUser) {
    return (
      <CustomText
        fontSize={bodySize}
        fontFamily={theme.fonts.REGULAR}
        color={theme.colors.white}
        style={styles.preWrap}
      >
        {text}
      </CustomText>
    );
  }

  const lines = text.split('\n');
  const extraActions = (actions || []).filter(
    a =>
      (a?.type === 'book' || a?.type === 'provider') &&
      a?.url &&
      !text.includes(a.url),
  );

  return (
    <View>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={`sp-${idx}`} style={styles.spacer} />;
        }

        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <View key={`li-${idx}`} style={styles.bulletRow}>
              <CustomText
                fontSize={bodySize}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
              >
                •
              </CustomText>
              <View style={styles.bulletContent}>
                {renderInline(bulletMatch[1], `b-${idx}`, true)}
              </View>
            </View>
          );
        }

        const numberedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <View key={`num-${idx}`} style={styles.numberedRow}>
              <View style={styles.bulletContent}>
                {renderInline(numberedMatch[1], `n-${idx}`, true)}
              </View>
            </View>
          );
        }

        return (
          <View key={`p-${idx}`} style={styles.paragraph}>
            {renderInline(trimmed, `p-${idx}`)}
          </View>
        );
      })}

      {extraActions.length > 0 ? (
        <View style={styles.actionsRow}>
          {extraActions.map((a, i) => (
            <Pressable
              key={`action-${i}`}
              onPress={() => a.url && navigateFromAssistantUrl(a.url)}
              style={({ pressed }) => [
                styles.actionBtn,
                pressed && styles.actionBtnPressed,
              ]}
            >
              <CustomText
                fontSize={actionSize}
                fontFamily={theme.fonts.SEMI_BOLD}
                color={theme.colors.white}
              >
                {a.label || t('home.assistantBookNow')}
              </CustomText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    preWrap: {
      lineHeight: theme.SH(20),
    },
    spacer: {
      height: theme.SH(6),
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.SW(8),
      marginBottom: theme.SH(4),
    },
    bulletContent: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    paragraph: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginBottom: theme.SH(4),
    },
    linkBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(5),
      marginVertical: theme.SH(3),
      marginRight: theme.SW(6),
    },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.SW(8),
      marginTop: theme.SH(8),
    },
    actionBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(6),
    },
    actionBtnPressed: {
      opacity: 0.85,
    },
    serviceName: {
      textDecorationLine: 'underline',
    },
    serviceNamePressed: {
      opacity: 0.7,
    },
    numberedRow: {
      marginBottom: theme.SH(6),
      paddingLeft: theme.SW(4),
    },
  });
