/** Small SVG charts: health-score ring, weight trend, body-condition gauge, macro split. */
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';

import type { WeightEntry } from '@/api/types';
import { shortDate } from '@/lib/format';
import { colors, fonts } from '@/theme';
import { Row, T } from './ui';

export function ScoreRing({ score, size = 64, stroke = 7, light }: { score: number; size?: number; stroke?: number; light?: boolean }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? colors.teal : score >= 60 ? colors.amber : colors.danger;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`Health score ${score} out of 100`}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={light ? 'rgba(255,255,255,0.18)' : colors.brand100} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={light ? colors.amber : color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(c * score) / 100} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <T v="h3" color={light ? colors.white : colors.ink} style={{ fontSize: size * 0.3, lineHeight: size * 0.36 }}>{score}</T>
    </View>
  );
}

export function WeightChart({ data, width, height = 150, idealMin, idealMax }: { data: WeightEntry[]; width: number; height?: number; idealMin?: number; idealMax?: number }) {
  if (data.length < 2) return null;
  const pad = { l: 8, r: 8, t: 16, b: 22 };
  const kgs = data.map((d) => d.kg);
  const lo = Math.min(...kgs, idealMin ?? Infinity) * 0.95;
  const hi = Math.max(...kgs, idealMax ?? -Infinity) * 1.04;
  const x = (i: number) => pad.l + (i * (width - pad.l - pad.r)) / (data.length - 1);
  const y = (kg: number) => pad.t + (1 - (kg - lo) / (hi - lo)) * (height - pad.t - pad.b);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)} ${y(d.kg)}`).join(' ');
  const area = `${line} L${x(data.length - 1)} ${height - pad.b} L${x(0)} ${height - pad.b} Z`;
  const lastI = data.length - 1;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.brand400} stopOpacity={0.35} />
          <Stop offset="1" stopColor={colors.brand400} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {idealMin != null && idealMax != null ? (
        <>
          <Rect x={pad.l} y={y(idealMax)} width={width - pad.l - pad.r} height={y(idealMin) - y(idealMax)} fill={colors.tealSoft} rx={6} />
          <SvgText x={width - pad.r - 4} y={y(idealMax) + 12} fontSize={10} fill={colors.teal} textAnchor="end" fontFamily={fonts.bodyBold}>Ideal range</SvgText>
        </>
      ) : null}
      <Line x1={pad.l} x2={width - pad.r} y1={height - pad.b} y2={height - pad.b} stroke={colors.line} />
      <Path d={area} fill="url(#wfill)" />
      <Path d={line} stroke={colors.brand600} strokeWidth={2.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <Circle key={d.date} cx={x(i)} cy={y(d.kg)} r={i === lastI ? 5 : 3} fill={i === lastI ? colors.amber : colors.white} stroke={colors.brand600} strokeWidth={2} />
      ))}
      <SvgText x={x(0)} y={height - 6} fontSize={10} fill={colors.muted} fontFamily={fonts.bodyMedium}>{shortDate(data[0].date)}</SvgText>
      <SvgText x={x(lastI)} y={height - 6} fontSize={10} fill={colors.muted} textAnchor="end" fontFamily={fonts.bodyMedium}>{shortDate(data[lastI].date)}</SvgText>
    </Svg>
  );
}

/** Horizontal band gauge for body condition (Under / Ideal / Over / Obese). */
export function BodyGauge({ ratio, width }: { ratio: number; width: number }) {
  const bands = [
    { label: 'Under', to: 0.85, color: colors.brand200 },
    { label: 'Ideal', to: 1.15, color: colors.teal },
    { label: 'Over', to: 1.3, color: colors.amber },
    { label: 'Obese', to: 1.5, color: colors.danger },
  ];
  const min = 0.6;
  const max = 1.5;
  const pos = (r: number) => ((Math.min(Math.max(r, min), max) - min) / (max - min)) * width;
  return (
    <View>
      <Svg width={width} height={34}>
        {bands.map((b, i) => {
          const x0 = pos(i === 0 ? min : bands[i - 1].to);
          const x1 = pos(b.to);
          return <Rect key={b.label} x={x0} y={10} width={x1 - x0 - 2} height={12} rx={6} fill={b.color} />;
        })}
        <Path d={`M${pos(ratio) - 7} 0 L${pos(ratio) + 7} 0 L${pos(ratio)} 9 Z`} fill={colors.ink} />
        <Rect x={pos(ratio) - 1.5} y={6} width={3} height={22} rx={1.5} fill={colors.ink} />
      </Svg>
      <Row style={{ justifyContent: 'space-between' }}>
        {bands.map((b) => <T key={b.label} v="caption">{b.label}</T>)}
      </Row>
    </View>
  );
}

export function MacroBar({ shares }: { shares: { protein: number; fat: number; carbs: number } }) {
  const parts = [
    { k: 'Protein', v: shares.protein, c: colors.brand600 },
    { k: 'Fat', v: shares.fat, c: colors.amber },
    { k: 'Carbs', v: shares.carbs, c: colors.teal },
  ];
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden' }}>
        {parts.map((p) => <View key={p.k} style={{ flex: p.v, backgroundColor: p.c }} />)}
      </View>
      <Row gap={14}>
        {parts.map((p) => (
          <Row key={p.k} gap={5}>
            <View style={{ width: 9, height: 9, borderRadius: 3, backgroundColor: p.c }} />
            <T v="caption">{p.k} {Math.round(p.v * 100)}%</T>
          </Row>
        ))}
      </Row>
    </View>
  );
}
