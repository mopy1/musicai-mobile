import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/lib/format';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  className?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  rightSlot,
  className,
}: ScreenHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between gap-3 pb-3 pt-1', className)}>
      <View className="flex-1">
        <Text className="text-2xl font-bold tracking-tight text-white" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-sm text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightSlot ? <View>{rightSlot}</View> : null}
    </View>
  );
}
