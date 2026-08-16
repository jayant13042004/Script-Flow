export interface Hook {
  id: string;
  text: string;
  category: HookCategory;
  example: string;
  isCustom?: boolean;
  userId?: string;
}

export type HookCategory = 'curiosity' | 'contrarian' | 'mistake' | 'story' | 'fear' | 'authority' | 'question' | 'myth-busting' | 'challenge' | 'data-statistic' | 'surprise' | 'emotional' | 'custom';
