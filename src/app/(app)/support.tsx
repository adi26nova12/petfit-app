import { ChevronDown, Clock, Mail, MessageCircle, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';

import { Card, Eyebrow, IconTile, Row, Screen, T, TopBar } from '@/components/ui';
import { colors } from '@/theme';

/** Support contacts as published on the web app (src/config/site.ts). */
const SUPPORT = { email: 'admin@petfit.fit', phone: '8130666920', hours: 'Mon–Sat, 10:00 AM – 7:00 PM IST', grievance: 'support@petfit.fit' };

const faqs = [
  { q: 'Do I pay a booking fee?', a: 'No. PetFit charges pet parents no booking fee — you pay the price shown on the card.' },
  { q: 'How are vets and groomers verified?', a: "PetFit checks each provider's licence and business details before their profile goes live." },
  { q: 'How do I cancel a booking?', a: 'Open My bookings, pick the booking and tap Cancel. Cancellation is free up to 2 hours before the slot.' },
  { q: 'Where do lab reports go?', a: "The lab uploads the report straight into your pet's vault under Pet profile → Vault." },
  { q: 'Can I add more than one pet?', a: 'Yes. Add as many pets as you like and switch between them from Home or the Pet profile.' },
];

export default function Support() {
  const [open, setOpen] = useState<number | null>(0);
  const contacts = [
    { icon: Phone, label: 'Call us', value: `+91 ${SUPPORT.phone}`, onPress: () => Linking.openURL(`tel:+91${SUPPORT.phone}`) },
    { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with the team', onPress: () => Linking.openURL(`https://wa.me/91${SUPPORT.phone}`) },
    { icon: Mail, label: 'Email', value: SUPPORT.email, onPress: () => Linking.openURL(`mailto:${SUPPORT.email}`) },
  ];
  return (
    <Screen>
      <TopBar title="Help & support" />
      <Eyebrow>We're here for you</Eyebrow>
      <T v="h1">How can we help?</T>
      <Row gap={6} style={{ marginTop: 6 }}>
        <Clock size={14} color={colors.muted} />
        <T v="small">{SUPPORT.hours}</T>
      </Row>

      <View style={{ gap: 10, marginTop: 18 }}>
        {contacts.map((c) => (
          <Card key={c.label} onPress={c.onPress} padded={false} style={{ padding: 14 }}>
            <Row gap={12}>
              <IconTile tone="purple" size={40}><c.icon size={19} color={colors.brand600} /></IconTile>
              <View style={{ flex: 1 }}>
                <T v="title">{c.label}</T>
                <T v="small">{c.value}</T>
              </View>
            </Row>
          </Card>
        ))}
      </View>

      <T v="h2" style={{ marginTop: 28, marginBottom: 10 }}>Common questions</T>
      <Card padded={false}>
        {faqs.map((f, i) => (
          <Pressable key={f.q} onPress={() => setOpen(open === i ? null : i)} style={{ padding: 16, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
            <Row gap={10}>
              <T v="title" style={{ flex: 1 }}>{f.q}</T>
              <ChevronDown size={18} color={colors.muted} style={{ transform: [{ rotate: open === i ? '180deg' : '0deg' }] }} />
            </Row>
            {open === i ? <T v="body" style={{ marginTop: 8 }}>{f.a}</T> : null}
          </Pressable>
        ))}
      </Card>

      <T v="caption" style={{ marginTop: 22 }}>
        Grievance officer: {SUPPORT.grievance}. Manayate Ventures Private Limited, W1-1501, Vatika Lifestyle Homes, Sector 83, Gurugram, Haryana 122004.
      </T>
    </Screen>
  );
}
