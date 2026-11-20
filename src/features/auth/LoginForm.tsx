import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';

import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';

export function LoginForm() {
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Ingresa tu correo electrónico y contraseña.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(cleanEmail, password);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión. Verifica tus credenciales.';
      setError(message);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => undefined,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="gap-4">
      <Input
        label="Correo electrónico"
        placeholder="tu@correo.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError(null);
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        returnKeyType="next"
        editable={!submitting}
        leftIcon={<Mail size={18} color="#94a3b8" />}
      />

      <Input
        label="Contraseña"
        placeholder="Tu contraseña"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (error) setError(null);
        }}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
        editable={!submitting}
        leftIcon={<Lock size={18} color="#94a3b8" />}
        rightElement={
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={10}
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="p-1"
          >
            {showPassword ? (
              <EyeOff size={18} color="#94a3b8" />
            ) : (
              <Eye size={18} color="#94a3b8" />
            )}
          </Pressable>
        }
      />

      {error ? (
        <View className="flex-row items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2.5">
          <AlertCircle size={16} color="#fb7185" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-xs leading-4 text-danger">{error}</Text>
        </View>
      ) : null}

      <Button
        label="Iniciar sesión"
        variant="primary"
        size="lg"
        fullWidth
        loading={submitting}
        onPress={() => void handleSubmit()}
        className="mt-1"
      />
    </View>
  );
}
