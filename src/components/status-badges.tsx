"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type {
  Competition,
  EntryDifficulty,
  IntentLevel,
  Recommendation,
  Trend,
} from "@/lib/types";

export function TrendBadge({ value }: { value: Trend }) {
  const t = useTranslations("enums.trend");
  const tone = value === "growing" ? "emerald" : value === "stable" ? "sky" : "rose";
  return <Badge tone={tone}>{t(value)}</Badge>;
}

export function CompetitionBadge({ value }: { value: Competition }) {
  const t = useTranslations("enums.competition");
  const tone = value === "low" ? "emerald" : value === "medium" ? "amber" : "rose";
  return <Badge tone={tone}>{t(value)}</Badge>;
}

export function LevelBadge({ value }: { value: IntentLevel }) {
  const t = useTranslations("enums.level");
  return <Badge tone={value === "high" ? "teal" : "slate"}>{t(value)}</Badge>;
}

export function EntryBadge({ value }: { value: EntryDifficulty }) {
  const t = useTranslations("enums.entry");
  const tone = value === "low" ? "emerald" : value === "medium" ? "amber" : "rose";
  return <Badge tone={tone}>{t(value)}</Badge>;
}

export function RecommendationBadge({ value }: { value: Recommendation }) {
  const t = useTranslations("enums.recommendation");
  const tone = value === "launch" ? "emerald" : value === "test" ? "amber" : "slate";
  return <Badge tone={tone}>{t(value)}</Badge>;
}
