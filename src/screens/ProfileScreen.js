import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const MENU_ITEMS = [
  { icon: 'person-outline',        label: 'My Profile',          },
  { icon: 'document-text-outline', label: 'My Applications',     },
  { icon: 'notifications-outline', label: 'Notifications',       },
  { icon: 'shield-checkmark-outline', label: 'Privacy & Security', },
  { icon: 'help-circle-outline',   label: 'Help & Support',      },
  { icon: 'information-circle-outline', label: 'About Asenso Bago', },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Profile</Text>
        </View>

        {/* Guest card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={36} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Guest User</Text>
            <Text style={styles.profileSub}>Sign in to access all features</Text>
          </View>
          <TouchableOpacity style={styles.signInBtn}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* City seal */}
        <View style={styles.sealRow}>
          <Image
            source={require('../../assets/images/bago-city-logo.png')}
            style={styles.sealImg}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.sealCity}>City of Bago</Text>
            <Text style={styles.sealProv}>Negros Occidental</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuBorder]}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={colors.red} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Asenso Bago v1.0.0{'\n'}© 2026 LGU Bago City</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.bg },
  scroll:     { flex: 1 },
  content:    { paddingBottom: 40 },

  header:     { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  heading:    { fontSize: 28, fontWeight: '900', color: colors.textPrimary },

  profileCard:{ flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: radius.card, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  avatarWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  profileName:{ fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  profileSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  signInBtn:  { backgroundColor: colors.red, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  signInBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  sealRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: radius.card, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  sealImg:    { width: 44, height: 44 },
  sealCity:   { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  sealProv:   { fontSize: 12, color: colors.textMuted },

  menuCard:   { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: radius.card, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20 },
  menuRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.red + '15', alignItems: 'center', justifyContent: 'center' },
  menuLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary },

  version:    { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
