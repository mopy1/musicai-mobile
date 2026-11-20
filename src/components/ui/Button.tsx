import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/format';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  costCredits?: number;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const VARIANT_BOX: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primaryHover',
  secondary: 'bg-surface border border-borderStrong active:bg-cardHover',
  ghost: 'bg-transparent active:bg-cardHover/60',
  danger: 'bg-danger/15 border border-danger/40 active:bg-danger/25',
};

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary: 'text-black font-semibold',
  secondary: 'text-white font-semibold',
  ghost: 'text-muted font-medium',
  danger: 'text-danger font-semibold',
};

const SIZE_BOX: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 rounded-lg',
  md: 'h-12 px-4 rounded-xl',
  lg: 'h-14 px-5 rounded-2xl',
};

const SIZE_TEXT: Record<ButtonSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  costCredits,
  leftIcon,
  fullWidth = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  const spinnerColor = variant === 'primary' ? '#000000' : variant === 'danger' ? '#fb7185' : '#ffffff';

  return (
    <Pressable
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2',
        VARIANT_BOX[variant],
        SIZE_BOX[size],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        leftIcon
      )}
      <Text className={cn(VARIANT_TEXT[variant], SIZE_TEXT[size])}>{label}</Text>
      {costCredits != null && costCredits > 0 && !loading && (
        <View
          className={cn(
            'rounded-full px-2 py-0.5',
            variant === 'primary' ? 'bg-black/15' : 'bg-white/10',
          )}
        >
          <Text
            className={cn(
              'text-[11px] font-bold',
              variant === 'primary' ? 'text-black' : 'text-primary',
            )}
          >
            {costCredits} créd.
          </Text>
        </View>
      )}
    </Pressable>
  );
}
