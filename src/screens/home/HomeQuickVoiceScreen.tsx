import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
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
} from '@components/common';
import HomeProviderItem from '@components/home/HomeProviderItem';
import { ThemeType, useThemeContext } from '@utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@store/hooks';
import {
  ServiceProvider,
  useGetServiceProviders,
} from '@services/api/queries/appQueries';
import { navigate } from '@utils/NavigationUtils';
import SCREEN_NAMES from '@navigation/ScreenNames';
import { formatAddress, getProviderDisplayName } from '@utils/tools';

const EVT_RESULTS = 'onSpeechResults';
const EVT_END = 'onSpeechEnd';
const EVT_ERROR = 'onSpeechError';

type ChatMsg =
  | { id: string; role: 'user'; text: string }
  | {
      id: string;
      role: 'assistant';
      text: string;
      providers?: ServiceProvider[];
      query?: string;
      isError?: boolean;
    };

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

export default function HomeQuickVoiceScreen() {
  const theme = useThemeContext();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMsg>>(null);

  const cityName =
    useAppSelector(state => {
      const fromAddr =
        state.app.currentLocationAddress?.cityName?.trim() || '';
      const uc = state.app.userCity;
      const fromSaved =
        typeof uc === 'object' && uc?.name ? String(uc.name).trim() : '';
      return fromAddr || fromSaved || '';
    }) || '';

  const lat = useAppSelector(
    state => state.app.currentLocationAddress?.lat?.trim() || '',
  );
  const lng = useAppSelector(
    state => state.app.currentLocationAddress?.lng?.trim() || '',
  );

  const welcomeMessage = useMemo(
    (): ChatMsg => ({
      id: 'welcome',
      role: 'assistant',
      text: t('home.quickVoiceAssistantWelcome'),
    }),
    [t],
  );

  const [thread, setThread] = useState<ChatMsg[]>([]);
  const [composerText, setComposerText] = useState('');
  const [listening, setListening] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState<{ q: string } | null>(
    null,
  );

  const activeQuery = searchTrigger?.q?.trim() ?? '';

  const {
    data,
    isFetching,
    isError,
  } = useGetServiceProviders({
    page: 1,
    limit: 8,
    search: activeQuery || undefined,
    cityName: cityName || undefined,
    lat,
    lng,
    sortBy: 'rating',
    enabled: activeQuery.length > 0,
  });

  const locale = useMemo(
    () => voiceLocaleFromAppLang(i18n.language),
    [i18n.language],
  );

  const listData = useMemo(
    () => [welcomeMessage, ...thread],
    [welcomeMessage, thread],
  );

  const appendTranscript = useCallback((text: string) => {
    const next = text.trim();
    if (!next) return;
    setComposerText(prev => {
      const p = prev.trim();
      return p ? `${p} ${next}` : next;
    });
  }, []);

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

        console.warn('Speech error:', e);
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
    if (!searchTrigger || isFetching) return;

    if (isError) {
      setThread(prev => [
        ...prev,
        {
          id: uuid(),
          role: 'assistant',
          text: t('home.quickVoiceAssistantReplyError'),
          isError: true,
        },
      ]);
      setSearchTrigger(null);
      return;
    }

    const providers = (data?.ResponseData ?? []) as ServiceProvider[];
    const q = searchTrigger.q;
    const text =
      providers.length > 0
        ? t('home.quickVoiceAssistantReplyFound', {
            count: providers.length,
            query: q,
          })
        : t('home.quickVoiceAssistantReplyEmpty');

    setThread(prev => [
      ...prev,
      {
        id: uuid(),
        role: 'assistant',
        text,
        providers,
        query: q,
      },
    ]);
    setSearchTrigger(null);
  }, [searchTrigger, isFetching, isError, data, t]);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [thread.length, isFetching]);

  const openProvider = useCallback(
    (provider: ServiceProvider) => {
      const bp = provider.businessProfile as any;
      navigate(SCREEN_NAMES.PROVIDER_DETAILS, {
        provider: {
          id: provider._id,
          name: getProviderDisplayName(provider, t('home.providerFallbackName')),
          logo: provider.profileImage,
          address:
            formatAddress({
              line1: bp?.line1 ?? '',
              line2: bp?.line2 ?? '',
              landmark: bp?.landmark ?? '',
              pincode: bp?.pincode ?? '',
              city: bp?.city?.name ?? '',
              country: bp?.country?.name ?? '',
            }) ||
            provider.city?.name ||
            '',
          serviceType: provider.cityName || bp?.cityName || '',
          rating: typeof provider.rating === 'number' ? provider.rating : null,
          reviewCount: 0,
        },
        prevScreenFlag: 'without_data',
      });
    },
    [t],
  );

  const openAllResults = useCallback(
    (query: string) => {
      navigate(SCREEN_NAMES.CATEGORY_PROVIDERS, {
        resetSession: true,
        initialSearch: query,
      });
    },
    [],
  );

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
    } catch (err: unknown) {
      console.warn('voiceStartListening failed', err);
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

  const handleSend = useCallback(() => {
    const q = composerText.trim();
    if (!q || isFetching) return;
    setThread(prev => [...prev, { id: uuid(), role: 'user', text: q }]);
    setComposerText('');
    setSearchTrigger({ q });
  }, [composerText, isFetching]);

  const sendDisabled =
    !composerText.trim() || isFetching || listening;

  const renderMessage: ListRenderItem<ChatMsg> = useCallback(
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
            <CustomText
              fontSize={theme.fontSize.md}
              fontFamily={theme.fonts.REGULAR}
              color={isUser ? theme.colors.white : theme.colors.text}
              style={styles.bubbleText}
            >
              {item.text}
            </CustomText>

            {item.role === 'assistant' &&
            item.providers &&
            item.providers.length > 0 ? (
              <View style={styles.providerBlock}>
                {item.providers.map(p => (
                  <HomeProviderItem
                    key={p._id}
                    provider={p}
                    layout="list"
                    onPress={() => openProvider(p)}
                  />
                ))}
                {item.query ? (
                  <Pressable
                    onPress={() => openAllResults(item.query!)}
                    style={({ pressed }) => [
                      styles.seeAllBtn,
                      pressed && styles.seeAllBtnPressed,
                    ]}
                  >
                    <CustomText
                      fontSize={theme.fontSize.sm}
                      fontFamily={theme.fonts.SEMI_BOLD}
                      color={theme.colors.primary}
                    >
                      {t('home.quickVoiceSeeAll')}
                    </CustomText>
                    <VectoreIcons
                      icon="Ionicons"
                      name="chevron-forward"
                      size={theme.SF(18)}
                      color={theme.colors.primary}
                    />
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>
      );
    },
    [
      openAllResults,
      openProvider,
      styles,
      t,
      theme.colors.primary,
      theme.colors.text,
      theme.colors.white,
      theme.fontSize.md,
      theme.fontSize.sm,
      theme.fonts.REGULAR,
      theme.fonts.SEMI_BOLD,
      theme.SF,
    ],
  );

  return (
    <Container safeArea={true} style={styles.container}>
      <AppHeader
        title={t('home.quickVoiceTitle')}
        onLeftPress={() => navigation.goBack()}
        backgroundColor="transparent"
        tintColor={theme.colors.text}
        containerStyle={{ marginHorizontal: theme.SW(20) }}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? insets.top + theme.SH(8) : 0
        }
      >
        <FlatList
          ref={listRef}
          data={listData}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            isFetching && searchTrigger ? (
              <View style={styles.searchingRow}>
                <ActivityIndicator color={theme.colors.primary} />
                <CustomText
                  fontSize={theme.fontSize.sm}
                  fontFamily={theme.fonts.MEDIUM}
                  color={theme.colors.lightText}
                  style={styles.searchingText}
                >
                  {t('home.quickVoiceSearching')}
                </CustomText>
              </View>
            ) : null
          }
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        <CustomText
          fontSize={theme.fontSize.sm}
          fontFamily={theme.fonts.REGULAR}
          color={theme.colors.lightText}
          style={styles.hint}
        >
          {t('home.quickVoiceHint')}
        </CustomText>

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
            placeholder={t('home.quickVoicePlaceholder')}
            placeholderTextColor={theme.colors.placeholder}
            multiline
            maxLength={500}
            editable={!listening && !isFetching}
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
      </KeyboardAvoidingView>
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
    listContent: {
      paddingHorizontal: theme.SW(16),
      paddingTop: theme.SH(8),
      paddingBottom: theme.SH(12),
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
    bubbleText: {
      lineHeight: theme.SH(22),
    },
    providerBlock: {
      marginTop: theme.SH(12),
      gap: 0,
    },
    seeAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.SW(4),
      paddingVertical: theme.SH(10),
      marginTop: theme.SH(4),
    },
    seeAllBtnPressed: {
      opacity: 0.75,
    },
    hint: {
      paddingHorizontal: theme.SW(20),
      marginBottom: theme.SH(8),
      lineHeight: theme.SH(20),
    },
    listeningRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
      paddingHorizontal: theme.SW(20),
      marginBottom: theme.SH(8),
    },
    listeningText: {
      marginLeft: theme.SW(4),
    },
    searchingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.SW(10),
      paddingVertical: theme.SH(8),
      paddingHorizontal: theme.SW(4),
    },
    searchingText: {
      flex: 1,
    },
    composerRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: theme.SW(16),
      paddingBottom: theme.SH(16),
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
