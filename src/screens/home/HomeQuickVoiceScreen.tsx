import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  FlatList,
  ListRenderItem,
  Alert,
} from 'react-native';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  addEventListener,
  destroy,
  isRecognitionAvailable,
  setRecognitionLanguage,
  startListening as voiceStartListening,
  stopListening as voiceStopListening,
} from '@ascendtis/react-native-voice-to-text';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import {
  AppHeader,
  Container,
  CustomText,
  showToast,
  VectoreIcons,
  KeyboardChatLayout,
} from '@components/common';
import AssistantMessageContent from '@components/home/AssistantMessageContent';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useAppSelector } from '@store/hooks';
import {
  type AiAssistantHistoryMeta,
  type AiAssistantMessage,
  clearAiAssistantHistory,
  fetchAiAssistantHistory,
  sendAiAssistantMessage,
} from '@services/api/queries/aiAssistantQueries';
import { isAxiosError } from 'axios';

const EVT_RESULTS = 'onSpeechResults';
const EVT_END = 'onSpeechEnd';
const EVT_ERROR = 'onSpeechError';

const MAX_MESSAGE_LENGTH = 2000;

const QUICK_PROMPT_KEYS = [
  'home.aiQuickPromptLastBooking',
  'home.aiQuickPromptProvidersTomorrow',
  'home.aiQuickPromptBookCleaning',
] as const;

const voiceLocaleFromAppLang = (lang: string | undefined): string => {
  const code = (lang || 'en').split('-')[0].toLowerCase();
  const map: Record<string, string> = {
    en: 'en-US',
    sp: 'es-ES',
    frcd: 'fr-CA',
    pt: 'pt-BR',
    hn: 'hi-IN',
  };
  return map[code] || 'en-US';
};

async function ensureAndroidMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const mic = PERMISSIONS.ANDROID.RECORD_AUDIO;
  let status = await check(mic);
  if (status === RESULTS.DENIED) {
    status = await request(mic);
  }
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
}

async function safeDestroyVoice(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await destroy();
    } catch {
      /* ignore */
    }
  }
}

async function safeStopVoice(): Promise<void> {
  try {
    await voiceStopListening();
  } catch {
    /* ignore */
  }
}

function messageKey(m: AiAssistantMessage, idx: number): string {
  return m._id || `${m.role}-${idx}-${m._local ? 'local' : 'remote'}`;
}

export default function HomeQuickVoiceScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const listRef = useRef<FlatList<AiAssistantMessage>>(null);
  const { isVisible: isKeyboardVisible } = useKeyboardState();

  const contextSpId: string | undefined = route.params?.contextSpId;

  const isAuthenticated = useAppSelector(
    state => state.auth.isAuthenticated,
  );

  const welcomeMessage = useMemo(
    (): AiAssistantMessage => ({
      role: 'assistant',
      content: t('home.aiAssistantWelcome'),
      _local: true,
    }),
    [t],
  );

  const [messages, setMessages] = useState<AiAssistantMessage[]>([]);
  const [composerText, setComposerText] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyMeta, setHistoryMeta] = useState<AiAssistantHistoryMeta | null>(
    null,
  );

  const quickPrompts = useMemo(
    () => QUICK_PROMPT_KEYS.map(key => t(key)),
    [t],
  );

  const locale = useMemo(
    () => voiceLocaleFromAppLang(i18n.language),
    [i18n.language],
  );

  const showQuickPrompts =
    !loading && !historyLoading && messages.length <= 1;

  const appendTranscript = useCallback((text: string) => {
    const next = text.trim();
    if (!next) return;
    setComposerText(prev => {
      const p = prev.trim();
      return p ? `${p} ${next}` : next;
    });
  }, []);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setMessages([welcomeMessage]);
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    setError(null);
    try {
      const res = await fetchAiAssistantHistory();
      if (res.succeeded) {
        const data = res.ResponseData || { messages: [] };
        const list = data.messages || [];
        setHistoryMeta({
          totalMessages: data.totalMessages ?? list.length,
          returnedMessages: data.returnedMessages ?? list.length,
          hasMore: Boolean(data.hasMore),
          limit: data.limit,
        });
        setMessages(
          list.length === 0 ? [welcomeMessage] : list,
        );
      } else {
        setHistoryMeta(null);
        setMessages([welcomeMessage]);
      }
    } catch (e: unknown) {
      setHistoryMeta(null);
      setMessages([welcomeMessage]);
      const msg = isAxiosError(e)
        ? (e.response?.data as { ResponseMessage?: string })?.ResponseMessage
        : undefined;
      setError(msg || t('home.aiAssistantHistoryError'));
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated, t, welcomeMessage]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const subResults = addEventListener(
      EVT_RESULTS,
      (e: { value?: string }) => {
        const chunk = e?.value;
        if (chunk) appendTranscript(chunk);
      },
    );

    const subEnd = addEventListener(EVT_END, () => {
      setListening(false);
    });

    const subError = addEventListener(
      EVT_ERROR,
      (e: { message?: string; code?: number }) => {
        const msg = e?.message || '';
        const lower = String(msg).toLowerCase();
        if (lower.includes('cancel')) return;
        if (lower.includes('no match') || lower.includes('no speech match'))
          return;
        if (e?.code === 7) return;

        showToast({
          type: 'error',
          title: t('messages.error'),
          message: msg || t('home.quickVoiceStartError'),
        });
        setListening(false);
      },
    );

    return () => {
      subResults.remove();
      subEnd.remove();
      subError.remove();
      void safeStopVoice();
      void safeDestroyVoice();
    };
  }, [appendTranscript, t]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length, loading, historyLoading]);

  useEffect(() => {
    if (!isKeyboardVisible) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [isKeyboardVisible]);

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const stopListening = useCallback(async () => {
    await safeStopVoice();
    setListening(false);
  }, []);

  const startListening = useCallback(async () => {
    await safeDestroyVoice();
    await safeStopVoice();

    const micOk = await ensureAndroidMicPermission();
    if (!micOk) {
      showToast({
        type: 'error',
        title: t('messages.error'),
        message: t('home.quickVoiceStartError'),
      });
      return;
    }

    let available = true;
    if (Platform.OS === 'android') {
      try {
        available = await isRecognitionAvailable();
      } catch {
        available = false;
      }
    }
    if (!available) {
      showToast({
        type: 'info',
        title: t('messages.error'),
        message: t('home.quickVoiceNotAvailable'),
      });
      return;
    }

    if (Platform.OS === 'android') {
      try {
        await setRecognitionLanguage(locale);
      } catch {
        /* ignore */
      }
    }

    try {
      setListening(true);
      await voiceStartListening();
    } catch {
      setListening(false);
      showToast({
        type: 'error',
        title: t('messages.error'),
        message: t('home.quickVoiceStartError'),
      });
    }
  }, [locale, t]);

  const toggleMic = useCallback(async () => {
    if (listening) {
      await stopListening();
      return;
    }
    await startListening();
  }, [listening, startListening, stopListening]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = String(text || '').trim();
      if (!trimmed || loading) return;

      if (!isAuthenticated) {
        setError(t('home.aiAssistantGuestError'));
        return;
      }

      if (trimmed.length > MAX_MESSAGE_LENGTH) {
        setError(t('home.aiAssistantMessageTooLong'));
        return;
      }

      setError(null);
      setComposerText('');
      setMessages(prev => [
        ...prev,
        { role: 'user', content: trimmed },
      ]);
      setLoading(true);

      try {
        const payload: { message: string; contextSpId?: string } = {
          message: trimmed,
        };
        if (contextSpId) payload.contextSpId = contextSpId;

        const res = await sendAiAssistantMessage(payload);
        if (res.succeeded) {
          const reply =
            res.ResponseData?.reply ||
            t('home.aiAssistantReplyFallback');
          const actions = res.ResponseData?.actions || [];
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: reply, actions },
          ]);
        } else {
          setError(res.ResponseMessage || t('home.aiAssistantSendError'));
        }
      } catch (e: unknown) {
        const isTimeout =
          isAxiosError(e) && e.code === 'ECONNABORTED';
        const serverMsg = isAxiosError(e)
          ? (e.response?.data as { ResponseMessage?: string })?.ResponseMessage
          : undefined;
        const status = isAxiosError(e) ? e.response?.status : undefined;

        setError(
          status === 403
            ? t('home.aiAssistantGuestError')
            : isTimeout
              ? t('home.aiAssistantTimeout')
              : serverMsg || t('home.aiAssistantSendError'),
        );

        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'user' && last.content === trimmed) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } finally {
        setLoading(false);
      }
    },
    [contextSpId, isAuthenticated, loading, t],
  );

  const handleSend = useCallback(() => {
    void sendMessage(composerText);
  }, [composerText, sendMessage]);

  const handleClearHistory = useCallback(() => {
    Alert.alert(
      t('home.aiAssistantClearTitle'),
      t('home.aiAssistantClearMessage'),
      [
        { text: t('home.aiAssistantClearCancel'), style: 'cancel' },
        {
          text: t('home.aiAssistantClearConfirm'),
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await clearAiAssistantHistory();
                setMessages([welcomeMessage]);
                setHistoryMeta(null);
                setError(null);
              } catch (e: unknown) {
                const msg = isAxiosError(e)
                  ? (e.response?.data as { ResponseMessage?: string })
                      ?.ResponseMessage
                  : undefined;
                setError(msg || t('home.aiAssistantClearError'));
              }
            })();
          },
        },
      ],
    );
  }, [t, welcomeMessage]);

  const sendDisabled =
    !composerText.trim() || loading || listening || historyLoading;

  const renderMessage: ListRenderItem<AiAssistantMessage> = useCallback(
    ({ item }) => {
      const isUser = item.role === 'user';
      return (
        <View
          style={[
            styles.msgRow,
            isUser ? styles.msgRowUser : styles.msgRowAssistant,
          ]}
        >
          <View
            style={[
              styles.bubble,
              isUser ? styles.bubbleUser : styles.bubbleAssistant,
            ]}
          >
            <AssistantMessageContent
              content={item.content}
              isUser={isUser}
              actions={item.actions}
              contextSpId={contextSpId}
            />
          </View>
        </View>
      );
    },
    [contextSpId, styles],
  );

  return (
    <Container safeArea={true} edges={['top']} style={styles.container}>
      <AppHeader
        title={t('home.aiAssistantTitle')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
        containerStyle={{ marginHorizontal: theme.SW(20) }}
        rightIconName="trash-outline"
        rightIconFamily="Ionicons"
        onRightPress={handleClearHistory}
      />

      <KeyboardChatLayout
        style={styles.body}
        footer={
          <>
            {error ? (
              <View style={styles.errorBanner}>
                <CustomText
                  fontSize={theme.fontSize.sm}
                  fontFamily={theme.fonts.REGULAR}
                  color="#B91C1C"
                  style={styles.errorText}
                >
                  {error}
                </CustomText>
                <Pressable onPress={() => setError(null)} hitSlop={8}>
                  <VectoreIcons
                    icon="Ionicons"
                    name="close-circle"
                    size={theme.SF(20)}
                    color={theme.colors.lightText}
                  />
                </Pressable>
              </View>
            ) : null}

            {!isKeyboardVisible ? (
              <CustomText
                fontSize={theme.fontSize.sm}
                fontFamily={theme.fonts.REGULAR}
                color={theme.colors.lightText}
                style={styles.hint}
              >
                {t('home.aiAssistantHint')}
              </CustomText>
            ) : null}

            {listening ? (
              <View style={styles.listeningRow}>
                <ActivityIndicator color={theme.colors.primary} />
                <CustomText
                  fontSize={theme.fontSize.sm}
                  fontFamily={theme.fonts.MEDIUM}
                  color={theme.colors.primary}
                  style={styles.listeningText}
                >
                  {t('home.quickVoiceListening')}
                </CustomText>
              </View>
            ) : null}

            <View style={styles.composerRow}>
              <TextInput
                style={styles.input}
                value={composerText}
                onChangeText={setComposerText}
                placeholder={t('home.aiAssistantPlaceholder')}
                placeholderTextColor={theme.colors.placeholder}
                multiline
                maxLength={MAX_MESSAGE_LENGTH}
                editable={!listening && !loading && !historyLoading}
                onFocus={scrollToLatest}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('home.quickVoiceListening')}
                onPress={toggleMic}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { borderColor: theme.colors.primary },
                  pressed && styles.iconBtnPressed,
                  listening && styles.iconBtnActive,
                ]}
              >
                <VectoreIcons
                  icon="Ionicons"
                  name={listening ? 'stop-circle' : 'mic'}
                  size={theme.SF(26)}
                  color={theme.colors.primary}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('home.quickVoiceSend')}
                onPress={handleSend}
                disabled={sendDisabled}
                style={({ pressed }) => [
                  styles.sendBtn,
                  { backgroundColor: theme.colors.primary },
                  sendDisabled && styles.sendBtnDisabled,
                  pressed && !sendDisabled && styles.sendBtnPressed,
                ]}
              >
                <VectoreIcons
                  icon="Ionicons"
                  name="send"
                  size={theme.SF(22)}
                  color={theme.colors.white}
                />
              </Pressable>
            </View>
          </>
        }
      >
        {historyLoading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={styles.flex}
            data={messages}
            keyExtractor={(m, idx) => messageKey(m, idx)}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListHeaderComponent={
              historyMeta?.hasMore ? (
                <CustomText
                  fontSize={theme.fontSize.xs}
                  fontFamily={theme.fonts.REGULAR}
                  color={theme.colors.lightText}
                  style={styles.historyBanner}
                >
                  {t('home.aiAssistantHistoryBanner', {
                    returned: historyMeta.returnedMessages,
                    total: historyMeta.totalMessages,
                  })}
                </CustomText>
              ) : null
            }
            ListFooterComponent={
              <>
                {loading ? (
                  <View style={styles.thinkingRow}>
                    <ActivityIndicator color={theme.colors.primary} />
                    <CustomText
                      fontSize={theme.fontSize.sm}
                      fontFamily={theme.fonts.MEDIUM}
                      color={theme.colors.lightText}
                      style={styles.thinkingText}
                    >
                      {t('home.aiAssistantThinking')}
                    </CustomText>
                  </View>
                ) : null}
                {showQuickPrompts ? (
                  <View style={styles.quickPrompts}>
                    {quickPrompts.map(q => (
                      <Pressable
                        key={q}
                        onPress={() => void sendMessage(q)}
                        style={({ pressed }) => [
                          styles.quickChip,
                          pressed && styles.quickChipPressed,
                        ]}
                      >
                        <CustomText
                          fontSize={theme.fontSize.xs}
                          fontFamily={theme.fonts.MEDIUM}
                          color={theme.colors.primary}
                        >
                          {q}
                        </CustomText>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </>
            }
            onContentSizeChange={scrollToLatest}
          />
        )}
      </KeyboardChatLayout>
    </Container>
  );
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    flex: { flex: 1 },
    body: {
      flex: 1,
    },
    centerLoader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(8),
      paddingBottom: theme.SH(16),
      flexGrow: 1,
    },
    historyBanner: {
      textAlign: 'center',
      marginBottom: theme.SH(12),
      lineHeight: theme.SH(18),
    },
    msgRow: {
      marginBottom: theme.SH(12),
      maxWidth: '100%',
    },
    msgRowUser: {
      alignSelf: 'flex-end',
    },
    msgRowAssistant: {
      alignSelf: 'flex-start',
    },
    bubble: {
      maxWidth: '92%',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.SW(14),
      paddingVertical: theme.SH(10),
    },
    bubbleUser: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: theme.SW(4),
    },
    bubbleAssistant: {
      backgroundColor: theme.colors.secondary || '#F3F4F6',
      borderBottomLeftRadius: theme.SW(4),
    },
    thinkingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
      paddingVertical: theme.SH(8),
      paddingLeft: theme.SW(4),
    },
    thinkingText: {
      flex: 1,
    },
    quickPrompts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.SW(8),
      paddingTop: theme.SH(8),
    },
    quickChip: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.SW(10),
      paddingVertical: theme.SH(6),
      backgroundColor: theme.colors.white,
    },
    quickChipPressed: {
      opacity: 0.8,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(8),
      marginHorizontal: theme.SW(16),
      marginTop: theme.SH(4),
      marginBottom: theme.SH(4),
      padding: theme.SW(10),
      borderRadius: theme.borderRadius.sm,
      backgroundColor: '#FEE2E2',
    },
    errorText: {
      flex: 1,
      lineHeight: theme.SH(20),
    },
    hint: {
      paddingHorizontal: theme.SW(20),
      marginBottom: theme.SH(4),
      lineHeight: theme.SH(20),
    },
    listeningRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
      paddingHorizontal: theme.SW(20),
      marginBottom: theme.SH(4),
    },
    listeningText: {
      marginLeft: theme.SW(4),
    },
    composerRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(4),
      paddingBottom: theme.SH(8),
      gap: theme.SW(8),
    },
    input: {
      flex: 1,
      minHeight: theme.SH(44),
      maxHeight: theme.SH(120),
      borderWidth: 1,
      borderColor: theme.colors.secondary || '#E0E0E0',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.SW(12),
      paddingVertical: theme.SH(10),
      fontSize: theme.fontSize.md,
      fontFamily: theme.fonts.REGULAR,
      color: theme.colors.text,
    },
    iconBtn: {
      width: theme.SW(48),
      height: theme.SW(48),
      borderRadius: theme.SW(24),
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.SH(2),
    },
    iconBtnPressed: {
      opacity: 0.88,
    },
    iconBtnActive: {
      opacity: 1,
    },
    sendBtn: {
      width: theme.SW(48),
      height: theme.SW(48),
      borderRadius: theme.SW(24),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.SH(2),
    },
    sendBtnDisabled: {
      opacity: 0.45,
    },
    sendBtnPressed: {
      opacity: 0.88,
    },
  });
