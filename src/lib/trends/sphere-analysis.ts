import { getSphere, queriesForSphere, sphereLabel } from "@/data/spheres";
import { analyzeNiche, type NicheAnalysis } from "./niche-analysis";

export type SphereAnalysis = NicheAnalysis & {
  sphereId: string;
  nameRu: string;
  nameEn: string;
};

export async function analyzeSphere(params: {
  sphereId: string;
  country: string;
  timeframe?: string;
  force?: boolean;
  queryLimit?: number;
  delayMs?: number;
  userId?: string | null;
}): Promise<SphereAnalysis> {
  const sphere = getSphere(params.sphereId);
  if (!sphere) {
    throw new Error(`Unknown sphere: ${params.sphereId}`);
  }
  const seeds = queriesForSphere(params.sphereId, params.queryLimit ?? 3);
  if (seeds.length === 0) {
    throw new Error(`No seed queries for sphere: ${params.sphereId}`);
  }

  const base = await analyzeNiche({
    nicheId: params.sphereId,
    country: params.country,
    timeframe: params.timeframe,
    force: params.force,
    upsertCatalog: false,
    queryLimit: params.queryLimit ?? 3,
    delayMs: params.delayMs ?? 3000,
    seedQueries: seeds,
    userId: params.userId,
  });

  const labelRu = sphereLabel(sphere, "ru");
  const labelEn = sphereLabel(sphere, "en");
  const ok = base.queries.filter((q) => q.ok).length;
  const failed = base.queries.length - ok;

  return {
    ...base,
    sphereId: sphere.id,
    nameRu: labelRu,
    nameEn: labelEn,
    aggregate: {
      ...base.aggregate,
      summaryRu: `Сфера «${labelRu}» · страна ${base.country}. Проанализировано ${ok} поисковых кластеров Trends. Средний интерес ${base.aggregate.avgInterest}/100, пик ${base.aggregate.peakInterest}, score ${base.aggregate.score}. Rising-запросов: ${base.aggregate.risingQueries.length}. Ошибок: ${failed}. Интерес относительный (не абсолютный volume).`,
      summaryEn: `Sphere “${labelEn}” · country ${base.country}. Analyzed ${ok} Trends search clusters. Avg interest ${base.aggregate.avgInterest}/100, peak ${base.aggregate.peakInterest}, score ${base.aggregate.score}. Rising queries: ${base.aggregate.risingQueries.length}. Failed: ${failed}. Interest is relative, not absolute volume.`,
    },
  };
}
