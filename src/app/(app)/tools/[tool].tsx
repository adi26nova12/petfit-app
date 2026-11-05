import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { Droplet, Flame, TriangleAlert } from '@/components/doodles';
import type { LifeStage } from '@/api/types';
import { BodyGauge, MacroBar } from '@/components/charts';
import { Button, Card, Chip, ChipRow, Field, IconTile, Notice, Pill, Row, Screen, Segmented, T, TopBar } from '@/components/ui';
import {
  CAT_WARNING,
  dogBreeds,
  estimateBodyCondition,
  foods,
  lifeStageFromDob,
  NUTRITION_DISCLAIMER,
  nutritionPlan,
  scheduleFor,
  type ToolSpecies,
} from '@/data/nutrition';
import { isoDay } from '@/lib/format';
import { useStore } from '@/store/app';
import { colors, space } from '@/theme';

type ToolKey = 'calories' | 'weight' | 'vaccines';

const dayMonth = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });

function Calories() {
  const { activePet } = useStore();
  const [species, setSpecies] = useState<ToolSpecies>(activePet?.species === 'cat' ? 'cat' : 'dog');
  const [kg, setKg] = useState(activePet ? String(activePet.weightKg) : '');
  const [stage, setStage] = useState<LifeStage>(lifeStageFromDob(activePet?.dob));
  const [summer, setSummer] = useState(false);
  const w = Number(kg.replace(',', '.'));
  const plan = w > 0 && w < 120 ? nutritionPlan({ species, weightKg: w, lifeStage: stage, summer }) : null;

  return (
    <>
      <Card style={{ gap: 14 }}>
        <Segmented value={species} onChange={setSpecies} options={[{ key: 'dog', label: 'Dog' }, { key: 'cat', label: 'Cat' }]} />
        <Field label="Weight (kg)" keyboardType="decimal-pad" value={kg} onChangeText={setKg} placeholder="e.g. 18" />
        <View style={{ gap: 8 }}>
          <T v="smallStrong">Life stage</T>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            {(['Puppy-Kitten', 'Adult', 'Senior'] as LifeStage[]).map((s) => (
              <Chip key={s} label={s === 'Puppy-Kitten' ? (species === 'cat' ? 'Kitten' : 'Puppy') : s} selected={stage === s} onPress={() => setStage(s)} />
            ))}
            {species === 'dog' ? <Chip label="☀ Summer" selected={summer} onPress={() => setSummer(!summer)} /> : null}
          </Row>
        </View>
      </Card>

      {plan ? (
        <>
          <Row gap={10} style={{ marginTop: 14 }} align="stretch">
            <Card style={{ flex: 1 }}>
              <IconTile tone="amber" size={36}><Flame size={26} color={colors.amberInk} /></IconTile>
              <T v="h1" style={{ marginTop: 10 }}>{plan.derKcal}</T>
              <T v="caption">kcal per day</T>
            </Card>
            <Card style={{ flex: 1 }}>
              <IconTile tone="teal" size={36}><Droplet size={26} color={colors.teal} /></IconTile>
              <T v="h1" style={{ marginTop: 10 }}>{plan.waterMl}</T>
              <T v="caption">ml water per day</T>
            </Card>
          </Row>
          <Card style={{ marginTop: 10 }}>
            <T v="title" style={{ marginBottom: 10 }}>Daily nutrient split</T>
            <MacroBar shares={plan.shares} />
            <Row style={{ justifyContent: 'space-between', marginTop: 14 }}>
              <T v="small">Protein <T v="smallStrong">{plan.proteinG} g</T></T>
              <T v="small">Fat <T v="smallStrong">{plan.fatG} g</T></T>
              <T v="small">Carbs <T v="smallStrong">{plan.carbsG} g</T></T>
            </Row>
          </Card>
          <Card style={{ marginTop: 10 }}>
            <T v="title">Good from the Indian kitchen</T>
            {foods[species].good.map((f) => <T key={f} v="small" style={{ marginTop: 6 }}>· {f}</T>)}
            <T v="title" color={colors.danger} style={{ marginTop: 14 }}>Avoid</T>
            {foods[species].avoid.map((f) => <T key={f} v="small" style={{ marginTop: 6 }}>· {f}</T>)}
          </Card>
          {species === 'cat' ? <Notice tone="blush" style={{ marginTop: 10 }} icon={<TriangleAlert size={18} color={colors.blushInk} />} title={CAT_WARNING} /> : null}
        </>
      ) : null}
      <T v="caption" style={{ marginTop: 14 }}>{NUTRITION_DISCLAIMER}</T>
    </>
  );
}

function IdealWeight() {
  const { width } = useWindowDimensions();
  const { activePet } = useStore();
  const initial = activePet?.species === 'dog' ? dogBreeds.find((b) => b.breed.startsWith(activePet.breed)) : undefined;
  const [breed, setBreed] = useState(initial ?? dogBreeds[0]);
  const [kg, setKg] = useState(initial && activePet ? String(activePet.weightKg) : '');
  const w = Number(kg.replace(',', '.'));
  const result = w > 0 ? estimateBodyCondition(breed, w) : null;
  const tone = result?.band === 'Ideal' ? 'teal' : result?.band === 'Obese' ? 'blush' : 'amber';

  return (
    <>
      <T v="smallStrong" style={{ marginBottom: 8 }}>Breed</T>
      <ChipRow>
        {dogBreeds.map((b) => <Chip key={b.breed} label={b.breed.replace(' (Indie)', '').replace(' (Caravan Hound)', '')} selected={b.breed === breed.breed} onPress={() => setBreed(b)} />)}
      </ChipRow>
      <Field style={{ marginTop: 14 }} label="Current weight (kg)" keyboardType="decimal-pad" value={kg} onChangeText={setKg} placeholder="e.g. 24" />

      {result ? (
        <Card style={{ marginTop: 14 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T v="h2">{result.band}</T>
            <Pill label="Estimate" tone="sand" />
          </Row>
          <T v="small" style={{ marginTop: 4 }}>Typical adult {breed.breed}: {result.idealMinKg}–{result.idealMaxKg} kg</T>
          <View style={{ marginTop: 16 }}>
            <BodyGauge ratio={result.ratio} width={width - space.gutter * 2 - 34} />
          </View>
          <Notice tone={tone} style={{ marginTop: 16 }} title={`Heat sensitivity: ${breed.heatSensitivity}`} body={breed.notes} />
        </Card>
      ) : null}
      <T v="caption" style={{ marginTop: 14 }}>For adult dogs. Build, muscle and age matter too — your vet can assess body condition in person.</T>
    </>
  );
}

function Vaccines() {
  const router = useRouter();
  const { activePet } = useStore();
  const [species, setSpecies] = useState<ToolSpecies>(activePet?.species === 'cat' ? 'cat' : 'dog');
  const [dob, setDob] = useState(activePet?.dob ?? isoDay(-70));
  const birth = useMemo(() => new Date(`${dob}T00:00:00`), [dob]);
  const rows = Number.isNaN(birth.getTime()) ? [] : scheduleFor(species, birth);

  return (
    <>
      <Card style={{ gap: 14 }}>
        <Segmented value={species} onChange={setSpecies} options={[{ key: 'dog', label: 'Dog' }, { key: 'cat', label: 'Cat' }]} />
        <Field label="Date of birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} maxLength={10} keyboardType="numbers-and-punctuation" />
      </Card>
      <Card padded={false} style={{ marginTop: 14 }}>
        {rows.map((r, i) => (
          <Row key={r.name} gap={12} style={{ padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: r.status === 'past' ? colors.teal : r.status === 'due' ? colors.amber : colors.brand200 }} />
            <View style={{ flex: 1 }}>
              <T v="title">{r.name}</T>
              <T v="caption">{dayMonth(r.from)} – {dayMonth(r.to)}</T>
            </View>
            {r.status === 'due' ? <Pill label="Due now" tone="amber" /> : r.status === 'past' ? <Pill label="Window passed" tone="sand" /> : <Pill label="Upcoming" tone="purple" />}
          </Row>
        ))}
      </Card>
      <Button label="Book a vaccination" full style={{ marginTop: 16 }} onPress={() => router.push({ pathname: '/service/[slug]', params: { slug: 'vaccination' } })} />
      <T v="caption" style={{ marginTop: 14 }}>The core schedule most vets follow. Your vet may adjust it — don't skip rabies, it's core in India.</T>
    </>
  );
}

export default function Tools() {
  const { tool = 'calories' } = useLocalSearchParams<{ tool?: string }>();
  const [active, setActive] = useState<ToolKey>((['calories', 'weight', 'vaccines'] as ToolKey[]).includes(tool as ToolKey) ? (tool as ToolKey) : 'calories');
  return (
    <Screen>
      <TopBar title="Health tools" subtitle="Free · same formulas as petfit.in" />
      <View style={{ marginBottom: 16 }}>
        <Segmented
          value={active}
          onChange={setActive}
          options={[
            { key: 'calories', label: 'Calories' },
            { key: 'weight', label: 'Ideal weight' },
            { key: 'vaccines', label: 'Vaccines' },
          ]}
        />
      </View>
      {active === 'calories' ? <Calories /> : active === 'weight' ? <IdealWeight /> : <Vaccines />}
    </Screen>
  );
}
