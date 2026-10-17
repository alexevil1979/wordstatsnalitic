import { z } from "zod";

export const opportunitySchema = z.object({
  countryCode: z.string().length(2),
  nicheId: z.string().min(1),
  queryCluster: z.string().min(2),
  searchVolume: z.coerce.number().int().min(0),
  trend: z.enum(["growing", "stable", "declining"]),
  competition: z.enum(["low", "medium", "high"]),
  commercialIntent: z.enum(["high", "medium"]),
  marginPotential: z.enum(["high", "medium"]),
  entryDifficulty: z.enum(["low", "medium", "high"]),
  recommendation: z.enum(["launch", "test", "not_now"]),
  exampleOffer: z.string().min(2),
  exampleOfferRu: z.string().min(2),
  priceRange: z.string().min(1),
  source: z.string().optional(),
  confidence: z.coerce.number().min(0).max(1).optional(),
});

export const opportunityUpdateSchema = opportunitySchema.partial();
