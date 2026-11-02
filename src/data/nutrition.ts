/**
 * Nutrition, body-condition and vaccine-schedule maths, ported from the web app's
 * `src/data/nutrition.ts` so the in-app Health Tools give the same answers as petfit.in.
 * Formula: RER = 70 × kg^0.75; DER = RER × life-stage factor; macro split by species/life stage.
 */
import type { LifeStage } from '@/api/types';

export type ToolSpecies = 'dog' | 'cat';

export const NUTRITION_DISCLAIMER =
  'Guideline from the vet nutrition chart, not a prescription. A vet should set the plan for illness, pregnancy, or rapid weight change.';
export const CAT_WARNING =
  'Cats are obligate carnivores and need taurine from meat. Do not keep them on a purely vegetarian diet.';

export const foods: Record<ToolSpecies, { good: string[]; avoid: string[] }> = {
  dog: {
    good: [
      'Protein: chicken, eggs, fish',
      'Carbs: rice, plain roti, bajra / jowar',
      'Calcium: curd, a little paneer',
      'Fiber: sweet potato, pumpkin, carrots',
      'Fat / omega-3: a spoon of ghee or fish oil',
    ],
    avoid: ['Onion, garlic, chocolate, grapes / raisins, xylitol, excess salt or spice'],
  },
  cat: {
    good: ['Protein: chicken or fish muscle meat (for taurine)', 'Water: wet food supplies part of the daily need'],
    avoid: ['Onion, garlic, chocolate, raw dough, xylitol, excess dairy'],
  },
};

const lifeStageFactor: Record<LifeStage, number> = { 'Puppy-Kitten': 2.5, Adult: 1.6, Senior: 1.4 };
const macros: Record<ToolSpecies, Record<LifeStage, { protein: number; fat: number }>> = {
  dog: { 'Puppy-Kitten': { protein: 0.3, fat: 0.175 }, Adult: { protein: 0.24, fat: 0.14 }, Senior: { protein: 0.22, fat: 0.1 } },
  cat: { 'Puppy-Kitten': { protein: 0.375, fat: 0.2 }, Adult: { protein: 0.325, fat: 0.175 }, Senior: { protein: 0.3, fat: 0.14 } },
};

export type BreedInfo = { breed: string; avgAdultKg: number; heatSensitivity: string; notes: string };

export const dogBreeds: BreedInfo[] = [
  { breed: 'Indian Pariah Dog (Indie)', avgAdultKg: 20, heatSensitivity: 'Low', notes: 'Hardy in Indian climate; low obesity risk; thrives on home-cooked food.' },
  { breed: 'Labrador Retriever', avgAdultKg: 30, heatSensitivity: 'Medium', notes: 'Prone to obesity and joint issues; watch portion control.' },
  { breed: 'Golden Retriever', avgAdultKg: 29, heatSensitivity: 'Medium', notes: 'Prone to obesity, hip dysplasia and skin allergies; regular grooming.' },
  { breed: 'German Shepherd', avgAdultKg: 30, heatSensitivity: 'Medium', notes: 'Prone to hip / elbow dysplasia and bloat; feed 2–3 smaller meals.' },
  { breed: 'Rottweiler', avgAdultKg: 45, heatSensitivity: 'Medium', notes: 'Large breed — needs joint-support diet.' },
  { breed: 'Doberman', avgAdultKg: 34, heatSensitivity: 'Low', notes: 'Prone to DCM; taurine / L-carnitine rich diet.' },
  { breed: 'Siberian Husky', avgAdultKg: 20, heatSensitivity: 'High (thick coat)', notes: 'Struggles in Indian heat; shade and extra water in summer.' },
  { breed: 'Beagle', avgAdultKg: 10, heatSensitivity: 'Low', notes: 'Very food motivated; strict portion control needed.' },
  { breed: 'Pug', avgAdultKg: 7, heatSensitivity: 'Very High (brachycephalic)', notes: 'Heat intolerant; prone to obesity; avoid overexertion.' },
  { breed: 'Shih Tzu', avgAdultKg: 6, heatSensitivity: 'High (brachycephalic)', notes: 'Heat sensitive; prone to dental issues.' },
  { breed: 'Pomeranian', avgAdultKg: 3, heatSensitivity: 'Medium (thick coat)', notes: 'Small calorie-dense portions; dental care.' },
  { breed: 'Cocker Spaniel', avgAdultKg: 13, heatSensitivity: 'Medium', notes: 'Prone to ear infections and obesity.' },
  { breed: 'Dachshund', avgAdultKg: 9, heatSensitivity: 'Low', notes: 'Keep lean to protect the back.' },
  { breed: 'Boxer', avgAdultKg: 28, heatSensitivity: 'Medium', notes: 'Prone to heart issues and bloat; smaller meals.' },
  { breed: 'French Bulldog', avgAdultKg: 11, heatSensitivity: 'Very High (brachycephalic)', notes: 'Severe heat intolerance.' },
  { breed: 'Rajapalayam', avgAdultKg: 22, heatSensitivity: 'Low', notes: 'Indian sighthound; protein-rich diet.' },
  { breed: 'Mudhol Hound (Caravan Hound)', avgAdultKg: 24, heatSensitivity: 'Low', notes: 'Indian sighthound; naturally lean, high energy.' },
];

export function lifeStageFromDob(dob?: string | null): LifeStage {
  if (!dob) return 'Adult';
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return 'Adult';
  const weeks = Math.max(0, Math.floor((Date.now() - d.getTime()) / 6048e5));
  return weeks < 52 ? 'Puppy-Kitten' : weeks < 364 ? 'Adult' : 'Senior';
}

export function nutritionPlan(input: { species: ToolSpecies; weightKg: number; lifeStage: LifeStage; summer?: boolean }) {
  const { species, weightKg: kg, lifeStage } = input;
  const rer = 70 * kg ** 0.75;
  const der = rer * lifeStageFactor[lifeStage];
  const m = macros[species][lifeStage];
  const carbs = 1 - m.protein - m.fat;
  const waterMl = species === 'dog' && input.summer ? 55 * kg * 1.25 : 50 * kg;
  return {
    rerKcal: Math.round(rer),
    derKcal: Math.round(der),
    waterMl: Math.round(waterMl),
    proteinG: Math.round((m.protein * der) / 4),
    fatG: Math.round((m.fat * der) / 9),
    carbsG: Math.round((carbs * der) / 4),
    shares: { protein: m.protein, fat: m.fat, carbs },
  };
}

export type BodyBand = 'Underweight' | 'Ideal' | 'Overweight' | 'Obese';
/** Estimate: ideal range approximated as ±15% of the breed's average adult weight (same as the web tool). */
export function estimateBodyCondition(breed: BreedInfo, weightKg: number) {
  const ratio = weightKg / breed.avgAdultKg;
  const band: BodyBand = ratio < 0.85 ? 'Underweight' : ratio <= 1.15 ? 'Ideal' : ratio <= 1.3 ? 'Overweight' : 'Obese';
  return {
    band,
    ratio,
    idealMinKg: Math.round(breed.avgAdultKg * 0.85 * 10) / 10,
    idealMaxKg: Math.round(breed.avgAdultKg * 1.15 * 10) / 10,
  };
}

/** Core vaccine schedule by age in weeks. The backend serves the authoritative list; this is the offline default. */
export const vaccineSchedule: Record<ToolSpecies, { name: string; minWeeks: number; maxWeeks: number | null }[]> = {
  dog: [
    { name: 'Puppy DP', minWeeks: 6, maxWeeks: 8 },
    { name: 'DHPPi/L — 1st dose', minWeeks: 8, maxWeeks: 10 },
    { name: 'DHPPi/L — 2nd dose', minWeeks: 11, maxWeeks: 13 },
    { name: 'Anti-rabies', minWeeks: 12, maxWeeks: 14 },
    { name: 'DHPPi/L — 3rd dose', minWeeks: 14, maxWeeks: 16 },
    { name: 'Annual booster (9-in-1 + rabies)', minWeeks: 52, maxWeeks: 56 },
    { name: 'Adult yearly', minWeeks: 104, maxWeeks: null },
  ],
  cat: [
    { name: 'Tri-cat — 1st dose', minWeeks: 8, maxWeeks: 10 },
    { name: 'Tri-cat — 2nd dose', minWeeks: 12, maxWeeks: 14 },
    { name: 'Anti-rabies', minWeeks: 12, maxWeeks: 16 },
    { name: 'Annual booster', minWeeks: 52, maxWeeks: 56 },
    { name: 'Adult yearly', minWeeks: 104, maxWeeks: null },
  ],
};

const WEEK = 6048e5;
export type DoseStatus = 'past' | 'due' | 'upcoming';
export function scheduleFor(species: ToolSpecies, birth: Date, now = Date.now()) {
  return vaccineSchedule[species].map((r) => {
    let from: Date;
    let to: Date;
    if (r.maxWeeks != null) {
      from = new Date(birth.getTime() + r.minWeeks * WEEK);
      to = new Date(birth.getTime() + r.maxWeeks * WEEK);
    } else {
      const ageYears = (now - birth.getTime()) / (365.25 * 864e5);
      from = new Date(birth);
      from.setFullYear(birth.getFullYear() + Math.max(2, Math.ceil(ageYears - 1 / 12)));
      to = new Date(from.getTime() + 4 * WEEK);
    }
    const status: DoseStatus = now > to.getTime() ? 'past' : now >= from.getTime() - WEEK ? 'due' : 'upcoming';
    return { name: r.name, from, to, status };
  });
}
