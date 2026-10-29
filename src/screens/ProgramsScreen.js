import React from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, Linking, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

const PROGRAMS = [
  {
    key:    'hw',
    name:   'Heart Warriors',
    badge:  'Cardiovascular Health',
    desc:   "Bago City's flagship cardiovascular health program — providing free heart check-ups, medicines, and health education to all 48 barangays.",
    stats:  [{ n: '5,000+', l: 'Beneficiaries' }, { n: '48', l: 'Barangays' }, { n: 'Free', l: 'Services' }],
    color:  colors.red,
    url:    'https://heart-warriors.vercel.app',
    cover:  require('../../assets/images/hw-cover.png'),
    logo:   require('../../assets/images/hw-logo.png'),
  },
  {
    key:    'wol',
    name:   'Wheels of Love',
    badge:  'PWD Mobility Program',
    desc:   'Providing free wheelchairs and mobility assistance to persons with disabilities across all 48 barangays of Bago City.',
    stats:  [{ n: '1,200+', l: 'Beneficiaries' }, { n: '48', l: 'Barangays' }, { n: 'Free', l: 'Wheelchairs' }],
    color:  '#e05c00',
    url:    'https://wheels-of-love.vercel.app',
    cover:  require('../../assets/images/wol-cover.png'),
    logo:   require('../../assets/images/wol-logo.png'),
  },
  {
    key:    'sbb',
    name:   'Smile Bright Bago',
    badge:  'Dental Health Program',
    desc:   'Free dental check-ups, tooth extraction, cleaning, and oral health education for all residents of Bago City.',
    stats:  [{ n: '5,000+', l: 'Beneficiaries' }, { n: '48', l: 'Barangays' }, { n: 'Free', l: 'Dental Care' }],
    color:  '#0077b6',
    url:    'https://smile-bright-bago.vercel.app',
    cover:  require('../../assets/images/sbb-cover.png'),
    logo:   require('../../assets/images/sbb-logo.png'),
  },
];

function ProgramCard({ program }) {
  return (
    <View style={styles.card}>
      <View style={styles.coverWrap}>
        <Image source={program.cover} style={styles.cover} resizeMode="cover" />
        <View style={[styles.coverOverlay, { backgroundColor: program.color + 'aa' }]} />
        <Image source={program.logo} style={styles.logo} />
      </View>
      <View style={styles.cardBody}>
        <View style={[styles.badge, { backgroundColor: program.color + '18' }]}>
          <Text style={[styles.badgeText, { color: program.color }]}>{program.badge}</Text>
        </View>
        <Text style={styles.cardTitle}>{program.name}</Text>
        <Text style={styles.cardDesc}>{program.desc}</Text>
        <View style={styles.statsRow}>
          {program.stats.map((s, i) => (
            <React.Fragment key={s.l}>
              <View style={styles.stat}>
                <Text style={[styles.statN, { color: program.color }]}>{s.n}</Text>
                <Text style={styles.statL}>{s.l}</Text>
              </View>
              {i < program.stats.length - 1 && <View style={styles.statDiv} />}
            </React.Fragment>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: program.color }]}
          onPress={() => Linking.openURL(program.url)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Visit {program.name}</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProgramsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Health</Text>
          <Text style={[styles.heading, { color: colors.red }]}>Programs</Text>
          <Text style={styles.subheading}>Official programs serving every Bagonhon</Text>
        </View>
        {PROGRAMS.map((p) => <ProgramCard key={p.key} program={p} />)}
        <Text style={styles.footer}>More programs coming soon</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.bg },
  scroll:     { flex: 1 },
  content:    { paddingBottom: 32 },

  header:     { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  heading:    { fontSize: 28, fontWeight: '900', color: colors.textPrimary, lineHeight: 34 },
  subheading: { fontSize: 14, color: colors.textMuted, marginTop: 4 },

  card:       { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: radius.card, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 4 },
  coverWrap:  { height: 160, position: 'relative' },
  cover:      { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject },
  logo:       { position: 'absolute', bottom: -20, left: 20, width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: '#fff', backgroundColor: '#fff' },

  cardBody:   { padding: 20, paddingTop: 28 },
  badge:      { alignSelf: 'flex-start', borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 10 },
  badgeText:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  cardTitle:  { fontSize: 20, fontWeight: '900', color: colors.textPrimary, marginBottom: 8 },
  cardDesc:   { fontSize: 13, color: colors.textSecondary, lineHeight: 20, marginBottom: 16 },

  statsRow:   { flexDirection: 'row', paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0', marginBottom: 16 },
  stat:       { flex: 1, alignItems: 'center' },
  statN:      { fontSize: 16, fontWeight: '900' },
  statL:      { fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 },
  statDiv:    { width: 1, backgroundColor: '#f0f0f0' },

  btn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: radius.btn },
  btnText:    { fontSize: 14, fontWeight: '700', color: '#fff' },

  footer:     { fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingVertical: 8 },
});
