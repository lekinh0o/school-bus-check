const primary = '#0F6B4D';
const primaryDark = '#0A4D38';
const primaryLight = '#E8F5F0';

export const palette = {
  primary,
  primaryDark,
  primaryLight,
  success: '#15803D',
  warning: '#F59E0B',
  danger: '#DC2626',
  error: '#B91C1C',
  info: '#2563EB',
  background: '#F4F6F8',
  surface: '#FFFFFF',
  surfaceSecondary: '#E8F5F0',
  pastelVehicle: '#DCFCE7',
  pastelSchool: '#E0E7FF',
  pastelRoute: '#FEF3C7',
  pastelStudent: '#EDE9FE',
  iconVehicle: '#0F6B4D',
  iconSchool: '#4F46E5',
  iconRoute: '#D97706',
  iconStudent: '#7C3AED',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  border: '#EEF2F6',
  divider: '#E2E8F0',
  disabled: '#94A3B8',
};

export const cardShadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
};

export default {
  light: {
    text: palette.textPrimary,
    background: palette.background,
    tint: primary,
    tabIconDefault: palette.disabled,
    tabIconSelected: primary,
    card: palette.surface,
    border: palette.border,
  },
  dark: {
    text: '#F8FAFC',
    background: '#020617',
    tint: '#34D399',
    tabIconDefault: '#64748B',
    tabIconSelected: '#34D399',
    card: '#0F172A',
    border: '#1E293B',
  },
};
