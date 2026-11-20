import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/format';

export interface CardProps extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className, ...rest }: CardProps) {
  const baseClass = cn(
    'rounded-2xl bg-card border border-borderSubtle p-4',
    onPress && 'active:bg-cardHover',
    className,
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={baseClass}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className={baseClass} {...rest}>
      {children}
    </View>
  );
}
