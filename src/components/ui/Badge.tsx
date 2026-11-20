import { Text, View } from 'react-native';

import { cn } from '@/lib/format';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  className?: string;
}

const TONE_BOX: Record<BadgeTone, string> = {
  neutral: 'bg-surface border-borderStrong',
  primary: 'bg-primary/15 border-primary/40',
  success: 'bg-success/15 border-success/40',
  warning: 'bg-warning/15 border-warning/40',
  danger: 'bg-danger/15 border-danger/40',
};

const TONE_TEXT: Record<BadgeTone, string> = {
  neutral: 'text-muted',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

export function Badge({ label, tone = 'neutral', className }: BadgeProps) {
  return (
    <View
      className={cn(
        'self-start rounded-full border px-2.5 py-0.5',
        TONE_BOX[tone],
        className,
      )}
    >
      <Text className={cn('text-[11px] font-semibold', TONE_TEXT[tone])}>
        {label}
      </Text>
    </View>
  );
}
