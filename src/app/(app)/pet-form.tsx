import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import * as api from '@/api';
import type { Species } from '@/api/types';
import { PetAvatar } from '@/components/blocks';
import { Button, Chip, ChipRow, Field, Row, Screen, Segmented, T, TopBar } from '@/components/ui';
import breeds from '@/data/breeds.json';
import { useStore } from '@/store/app';
import { colors, radius } from '@/theme';

const speciesOptions: { key: Species; label: string }[] = [
  { key: 'dog', label: 'Dog' },
  { key: 'cat', label: 'Cat' },
  { key: 'bird', label: 'Bird' },
  { key: 'rabbit', label: 'Rabbit' },
  { key: 'other', label: 'Other' },
];
const breedList = breeds as Record<string, string[]>;

/** dd/mm/yyyy <-> yyyy-mm-dd */
const toDisplay = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '');
const toIso = (dmy: string) => {
  const m = dmy.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) || d > new Date() ? null : iso;
};

export default function PetForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { state, dispatch } = useStore();
  const existing = state.pets.find((p) => p.id === id);

  const [name, setName] = useState(existing?.name ?? '');
  const [species, setSpecies] = useState<Species>(existing?.species ?? 'dog');
  const [breed, setBreed] = useState(existing?.breed ?? '');
  const [breedQuery, setBreedQuery] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>(existing?.gender ?? 'male');
  const [dob, setDob] = useState(toDisplay(existing?.dob ?? ''));
  const [weight, setWeight] = useState(existing ? String(existing.weightKg) : '');
  const [sterilised, setSterilised] = useState(existing?.sterilised ?? false);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  const options = useMemo(() => {
    const all = breedList[species] ?? ['Mixed'];
    const q = breedQuery.trim().toLowerCase();
    return (q ? all.filter((b) => b.toLowerCase().includes(q)) : all).slice(0, 14);
  }, [species, breedQuery]);

  const isoDob = toIso(dob);
  const kg = Number(weight.replace(',', '.'));
  const errors = {
    name: !name.trim() ? 'Add a name' : undefined,
    breed: !breed ? 'Pick a breed' : undefined,
    dob: !isoDob ? 'Use DD/MM/YYYY' : undefined,
    weight: !(kg > 0 && kg < 120) ? 'Weight in kg' : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const save = async () => {
    setTouched(true);
    if (!valid || !isoDob) return;
    setSaving(true);
    const pet = await api.savePet({
      id: existing?.id,
      name: name.trim(),
      species,
      breed,
      gender,
      dob: isoDob,
      weightKg: kg,
      sterilised,
      microchipId: existing?.microchipId ?? null,
      photo: existing?.photo ?? null,
    });
    dispatch({ type: 'pet', pet: { ...pet, healthScore: existing?.healthScore ?? pet.healthScore } });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen footer={<Button label={existing ? 'Save changes' : 'Add pet'} size="lg" full loading={saving} onPress={save} />}>
        <TopBar title={existing ? `Edit ${existing.name}` : 'Add a pet'} />

        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <View>
            <PetAvatar pet={{ name: name || '?', photo: existing?.photo ?? null }} size={96} />
            {/* Production: expo-image-picker → upload → set `photo` to the returned URL. */}
            <Pressable accessibilityLabel="Add photo" style={styles.cam}>
              <Camera size={16} color={colors.white} />
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 18 }}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Pip" error={touched ? errors.name : undefined} />

          <View style={{ gap: 8 }}>
            <T v="smallStrong">Species</T>
            <ChipRow>
              {speciesOptions.map((s) => (
                <Chip key={s.key} label={s.label} selected={species === s.key} onPress={() => { setSpecies(s.key); setBreed(''); }} />
              ))}
            </ChipRow>
          </View>

          <View style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <T v="smallStrong">Breed</T>
              {breed ? <T v="smallStrong" color={colors.brand600}>{breed}</T> : null}
            </Row>
            <Field value={breedQuery} onChangeText={setBreedQuery} placeholder="Search breeds" returnKeyType="search" />
            <View style={styles.breeds}>
              {options.map((b) => (
                <Chip key={b} label={b} selected={breed === b} onPress={() => setBreed(b)} />
              ))}
            </View>
            {touched && errors.breed ? <T v="caption" color={colors.danger}>{errors.breed}</T> : null}
          </View>

          <View style={{ gap: 8 }}>
            <T v="smallStrong">Gender</T>
            <Segmented value={gender} onChange={setGender} options={[{ key: 'male', label: 'Male' }, { key: 'female', label: 'Female' }]} />
          </View>

          <Row gap={12} align="flex-start">
            <Field
              style={{ flex: 1 }}
              label="Date of birth"
              placeholder="DD/MM/YYYY"
              keyboardType="number-pad"
              maxLength={10}
              value={dob}
              error={touched ? errors.dob : undefined}
              onChangeText={(t) => {
                const d = t.replace(/\D/g, '').slice(0, 8);
                setDob([d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join('/'));
              }}
            />
            <Field style={{ flex: 1 }} label="Weight (kg)" placeholder="e.g. 12.5" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} error={touched ? errors.weight : undefined} />
          </Row>

          <Row style={styles.toggle}>
            <View style={{ flex: 1 }}>
              <T v="title">Spayed / neutered</T>
              <T v="caption">Changes daily calorie needs</T>
            </View>
            <Switch value={sterilised} onValueChange={setSterilised} trackColor={{ true: colors.brand600, false: colors.brand100 }} thumbColor={colors.white} />
          </Row>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  cam: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.brand600,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.cream,
  },
  breeds: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toggle: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14 },
});
