type TranslationLeaf = string | number | boolean | null;
export type TranslationValue =
  | TranslationLeaf
  | TranslationValue[]
  | { [key: string]: TranslationValue };

export function deepMergeTranslations<T extends TranslationValue>(
  base: T,
  override: TranslationValue,
): T {
  if (Array.isArray(base) || Array.isArray(override)) return (override as T) ?? base;
  if (
    base &&
    override &&
    typeof base === 'object' &&
    typeof override === 'object'
  ) {
    const out: Record<string, TranslationValue> = { ...(base as any) };
    for (const [k, v] of Object.entries(override as any)) {
      if (v === undefined) continue;
      out[k] = k in out ? deepMergeTranslations(out[k] as any, v) : v;
    }
    return out as T;
  }
  return ((override as any) ?? base) as T;
}

