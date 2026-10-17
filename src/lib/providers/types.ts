import type { KeywordOpportunity } from "../types";

export type PartialOpportunity = Partial<KeywordOpportunity> & {
  queryCluster: string;
  countryCode: string;
};

export interface KeywordProvider {
  readonly name: string;
  search(params: {
    query: string;
    country: string;
  }): Promise<PartialOpportunity[]>;
}
