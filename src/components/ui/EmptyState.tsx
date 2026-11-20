import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/format';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        'items-center justify-center rounded-2xl border border-dashed border-borderStrong bg-card/60 px-6 py-10',
        className,
      )}
    >
      {icon ? <View className="mb-3">{icon}</View> : null}
      <Text className="text-center text-base font-semibold text-white">{title}</Text>
      {description ? (
        <Text className="mt-1.5 text-center text-sm text-muted">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} size="sm" className="mt-4" />
      ) : null}
    </View>
  );
}
