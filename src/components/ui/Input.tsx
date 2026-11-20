import type { ReactNode } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { cn } from '@/lib/format';

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string | null;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export function Input({
  label,
  helperText,
  error,
  leftIcon,
  rightElement,
  containerClassName,
  inputClassName,
  multiline,
  ...rest
}: InputProps) {
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? (
        <Text className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </Text>
      ) : null}
      <View
        className={cn(
          'flex-row rounded-xl border bg-surface px-3.5',
          multiline ? 'min-h-[104px] items-start py-3' : 'h-12 items-center',
          error ? 'border-danger' : 'border-borderStrong',
        )}
      >
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor="#64748b"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          className={cn(
            'flex-1 text-sm text-white',
            multiline && 'min-h-[80px]',
            inputClassName,
          )}
          {...rest}
        />
        {rightElement ? <View className="ml-2">{rightElement}</View> : null}
      </View>
      {error ? (
        <Text className="text-xs text-danger">{error}</Text>
      ) : helperText ? (
        <Text className="text-xs text-muted">{helperText}</Text>
      ) : null}
    </View>
  );
}
