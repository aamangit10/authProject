import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  Platform 
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActionDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          btn: [
            styles.secondaryBtn,
            isHovered && styles.secondaryBtnHover,
          ],
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          btn: [
            styles.outlineBtn,
            isHovered && styles.outlineBtnHover,
          ],
          text: styles.outlineText,
        };
      case 'danger':
        return {
          btn: [
            styles.dangerBtn,
            isHovered && styles.dangerBtnHover,
          ],
          text: styles.dangerText,
        };
      case 'ghost':
        return {
          btn: [
            styles.ghostBtn,
            isHovered && styles.ghostBtnHover,
          ],
          text: styles.ghostText,
        };
      case 'primary':
      default:
        return {
          btn: [
            styles.primaryBtn,
            isHovered && styles.primaryBtnHover,
          ],
          text: styles.primaryText,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isActionDisabled}
      // @ts-ignore
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.baseButton,
        vStyles.btn,
        isActionDisabled && styles.disabledBtn,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#2563EB'} 
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              vStyles.text,
              isActionDisabled && styles.disabledText,
              Boolean(icon) && { marginLeft: 8 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  baseText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  // Primary (Dark charcoal / Linear style)
  primaryBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#0F172A',
  },
  primaryBtnHover: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  // Secondary (Muted slate)
  secondaryBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnHover: {
    backgroundColor: '#E2E8F0',
  },
  secondaryText: {
    color: '#1E293B',
  },
  // Outline
  outlineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  outlineBtnHover: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  outlineText: {
    color: '#0F172A',
  },
  // Danger
  dangerBtn: {
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  dangerBtnHover: {
    backgroundColor: '#DC2626',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  // Ghost
  ghostBtn: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  ghostBtnHover: {
    backgroundColor: '#F1F5F9',
  },
  ghostText: {
    color: '#64748B',
  },
  // Disabled
  disabledBtn: {
    opacity: 0.55,
    ...(Platform.OS === 'web' ? ({ cursor: 'not-allowed' } as any) : {}),
  },
  disabledText: {
    color: '#94A3B8',
  },
});
