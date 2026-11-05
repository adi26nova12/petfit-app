import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { House, MapPin, Store } from '@/components/doodles';
import * as api from '@/api';
import type { Address } from '@/api/types';
import { Button, Card, Field, Row, Screen, Segmented, T, TopBar } from '@/components/ui';
import { useStore } from '@/store/app';
import { colors } from '@/theme';

export default function Addresses() {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState<Address['label']>('Home');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState(state.user?.city ?? '');
  const [pincode, setPincode] = useState('');
  const [saving, setSaving] = useState(false);
  const valid = line1.trim() && city.trim() && /^\d{6}$/.test(pincode);

  const save = async () => {
    setSaving(true);
    const address = await api.saveAddress({ label, line1, line2, city, pincode });
    dispatch({ type: 'address', address });
    setSaving(false);
    setAdding(false);
    setLine1('');
    setLine2('');
    setPincode('');
  };

  return (
    <Screen>
      <TopBar title="Saved addresses" />
      <View style={{ gap: 10 }}>
        {state.addresses.map((a) => (
          <Card key={a.id}>
            <Row gap={12} align="flex-start">
              {a.label === 'Home' ? <House size={20} color={colors.brand600} /> : a.label === 'Work' ? <Store size={20} color={colors.brand600} /> : <MapPin size={20} color={colors.brand600} />}
              <View style={{ flex: 1 }}>
                <T v="title">{a.label}</T>
                <T v="small">{a.line1}</T>
                <T v="small">{a.line2}, {a.city} {a.pincode}</T>
              </View>
            </Row>
          </Card>
        ))}
      </View>

      {adding ? (
        <Card style={{ marginTop: 16, gap: 14 }}>
          <T v="h3">New address</T>
          <Segmented value={label} onChange={setLabel} options={[{ key: 'Home', label: 'Home' }, { key: 'Work', label: 'Work' }, { key: 'Other', label: 'Other' }]} />
          {/* Production: prefill from expo-location + a geocoding API. */}
          <Field label="Flat, house, building" value={line1} onChangeText={setLine1} />
          <Field label="Area, sector, landmark" value={line2} onChangeText={setLine2} />
          <Row gap={12}>
            <Field style={{ flex: 1 }} label="City" value={city} onChangeText={setCity} />
            <Field style={{ flex: 1 }} label="Pincode" keyboardType="number-pad" maxLength={6} value={pincode} onChangeText={setPincode} />
          </Row>
          <Row gap={10}>
            <Button label="Cancel" variant="outline" onPress={() => setAdding(false)} />
            <Button label="Save address" disabled={!valid} loading={saving} onPress={save} style={{ flex: 1 }} full />
          </Row>
        </Card>
      ) : (
        <Button label="Add new address" variant="outline" full style={{ marginTop: 16 }} icon={<Plus size={18} color={colors.ink} />} onPress={() => setAdding(true)} />
      )}
    </Screen>
  );
}
