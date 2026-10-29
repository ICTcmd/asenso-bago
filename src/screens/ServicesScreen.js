import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const SERVICES = [
  { icon: 'desktop-outline',          title: 'E-Services',              desc: 'Online government transactions and forms.', color: colors.red },
  { icon: 'medkit-outline',           title: 'Health Services',         desc: 'Book appointments at city health centers.', color: '#10b981' },
  { icon: 'car-outline',              title: 'Asenso Caravan',          desc: 'Government services brought to your barangay.', color: '#f97316', url: 'https://asenso-caravan.vercel.app' },
  { icon: 'school-outline',           title: 'Scholarship Programs',    desc: 'Apply for city-funded educational scholarships.', color: '#6366f1' },
  { icon: 'cash-outline',             title: 'Social Welfare',          desc: 'Access DSWD and city social welfare programs.', color: '#ec4899' },
  { icon: 'construct-outline',        title: 'Infrastructure Reports',  desc: 'Report road damage, flooding, and public works issues.', color: '#f97316' },
  { icon: 'people-outline',           title: 'Barangay Services',       desc: 'Connect with your barangay hall for local services.', color: '#14b8a6' },
  { icon: 'airplane-outline',         title: 'Tourism',                 desc: 'Discover Bago City tourist spots and events.', color: '#8b5cf6' },
  { icon: 'leaf-outline',             title: 'Environment',             desc: 'Garbage schedules and environmental reports.', color: '#22c55e' },
];

export default function ServicesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>City</Text>
          <Text style={[styles.heading, { color: colors.red }]}>Services</Text>
          <Text style={styles.subheading}>All Bago City services — more launching soon</Text>
        </View>

        <View style={styles.banner}>
          <Ionicons name="construct-outline" size={20} color={colors.red} />
          <Text style={styles.bannerText}>New services are being added regularly. Check back soon!</Text>
        </View>

        <View style={styles.grid}>
          {SERVICES.map((s) => (
            <TouchableOpacity 
              key={s.title} 
              style={styles.card} 
              activeOpacity={0.75} 
              disabled={!s.url}
              onPress={() => s.url && Linking.openURL(s.url)}
            >
              <View style={[styles.iconWrap, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon} size={26} color={s.color} />
              </View>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardDesc}>{s.desc}</Text>
              {!s.url && (
                <View style={styles.comingSoon}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.bg },
  scroll:     { flex: 1 },
  content:    { paddingBottom: 32 },

  header:     { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  heading:    { fontSize: 28, fontWeight: '900', color: colors.textPrimary, lineHeight: 34 },
  subheading: { fontSize: 14, color: colors.textMuted, marginTop: 4 },

  banner:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 16, backgroundColor: colors.red + '10', borderRadius: radius.card, padding: 14 },
  bannerText: { flex: 1, fontSize: 13, color: colors.textSecondary, lineHeight: 19 },

  grid:       { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 12 },
  card:       { width: '47%', backgroundColor: '#fff', borderRadius: radius.card, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  iconWrap:   { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardTitle:  { fontSize: 13, fontWeight: '800', color: colors.textPrimary, marginBottom: 4 },
  cardDesc:   { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginBottom: 10 },
  comingSoon: { backgroundColor: '#f5f5f5', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  comingSoonText: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5 },
});
