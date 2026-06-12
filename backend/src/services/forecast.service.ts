import * as tf from '@tensorflow/tfjs';

export interface SeriesPoint {
  date: string;
  value: number;
}

export interface Forecast {
  history: SeriesPoint[];
  prediction: SeriesPoint[];
  trend: 'up' | 'down' | 'flat';
  changePct: number;
  confidence: number;
  dataPoints: number;
  sufficient: boolean;
  predictedTotal: number;
}

const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const round = (v: number, dp = 2) => Number(v.toFixed(dp));

function rSquared(actual: number[], predicted: number[]): number {
  const m = mean(actual);
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < actual.length; i += 1) {
    ssRes += (actual[i] - predicted[i]) ** 2;
    ssTot += (actual[i] - m) ** 2;
  }
  return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
}

/**
 * Fits a linear trend (single-variable regression trained with TensorFlow.js)
 * over a daily series and projects `horizon` days forward.
 *
 * The model is real, but the data usually isn't deep yet — so confidence is
 * derived from fit quality AND data volume, and `sufficient` is false when there
 * isn't enough history to forecast meaningfully. We never present a confident
 * number on top of one or two data points.
 */
export async function forecastSeries(daily: SeriesPoint[], horizon = 7): Promise<Forecast> {
  const n = daily.length;
  const values = daily.map((p) => p.value);
  const nonZero = values.filter((v) => v > 0).length;
  const sufficient = n >= 14 && nonZero >= 5;

  const maxY = Math.max(...values, 1);
  const xs = daily.map((_, i) => (n > 1 ? i / (n - 1) : 0));
  const ysN = values.map((v) => v / maxY);

  // y = a*x + b, trained with Adam (a genuine tfjs optimisation loop).
  const xT = tf.tensor1d(xs);
  const yT = tf.tensor1d(ysN);
  const a = tf.variable(tf.scalar(0));
  const b = tf.variable(tf.scalar(mean(ysN)));
  const opt = tf.train.adam(0.1);
  for (let i = 0; i < 300; i += 1) {
    opt.minimize(() => tf.losses.meanSquaredError(yT, a.mul(xT).add(b)) as tf.Scalar);
  }
  const slope = a.dataSync()[0];
  const intercept = b.dataSync()[0];
  xT.dispose();
  yT.dispose();
  a.dispose();
  b.dispose();

  const fittedN = xs.map((x) => slope * x + intercept);
  const r2 = rSquared(ysN, fittedN);

  const lastDate = n > 0 ? new Date(daily[n - 1].date) : new Date();
  const prediction: SeriesPoint[] = [];
  for (let h = 1; h <= horizon; h += 1) {
    const x = n > 1 ? (n - 1 + h) / (n - 1) : 0;
    const v = Math.max(0, (slope * x + intercept) * maxY);
    const d = new Date(lastDate);
    d.setDate(d.getDate() + h);
    prediction.push({ date: d.toISOString().slice(0, 10), value: round(v, 1) });
  }

  const recentAvg = mean(values.slice(-Math.min(7, n)));
  const predAvg = mean(prediction.map((p) => p.value));
  const changePct = recentAvg > 0 ? ((predAvg - recentAvg) / recentAvg) * 100 : 0;
  const trend = Math.abs(changePct) < 5 ? 'flat' : changePct > 0 ? 'up' : 'down';

  const volume = clamp01(nonZero / 14);
  const confidence = sufficient ? clamp01(0.35 + 0.5 * Math.max(0, r2) + 0.15 * volume) : clamp01(0.15 * volume);

  return {
    history: daily,
    prediction,
    trend,
    changePct: round(changePct),
    confidence: round(confidence),
    dataPoints: nonZero,
    sufficient,
    predictedTotal: round(prediction.reduce((s, p) => s + p.value, 0), 1),
  };
}
