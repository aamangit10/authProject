import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral' | 'accent';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  dot = true,
}) => {
  const isSm = size === 'sm';

  const getColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#065F46',
          dot: '#10B981',
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          text: '#991B1B',
          dot: '#EF4444',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          text: '#92400E',
          dot: '#F59E0B',
        };
      case 'accent':
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          text: '#1E40AF',
          dot: '#3B82F6',
        };
      case 'neutral':
      default:
        return {
          bg: '#F8FAFC',
          border: '#E2E8F0',
          text: '#475569',
          dot: '#94A3B8',
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 9,
        },
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: colors.dot,
              width: isSm ? 5 : 6,
              height: isSm ? 5 : 6,
              borderRadius: 3,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSm ? 11 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: 5,
  },
  text: {
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});
