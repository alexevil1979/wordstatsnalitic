#!/usr/bin/env python3
"""Google Trends client via pytrends. Invoked from Node with JSON on stdin/stdout."""
from __future__ import annotations

import json
import sys
import time
from typing import Any

# Country ISO2 → Google Trends geo
GEO_MAP = {
    "US": "US",
    "GB": "GB",
    "DE": "DE",
    "CA": "CA",
    "AU": "AU",
    "AE": "AE",
    "SA": "SA",
    "RU": "RU",
    "KZ": "KZ",
    "UZ": "UZ",
    "NL": "NL",
    "SG": "SG",
}


def fail(message: str, code: int = 1) -> None:
    print(json.dumps({"ok": False, "error": message}), flush=True)
    sys.exit(code)


def main() -> None:
    try:
        raw = sys.stdin.read()
        req = json.loads(raw or "{}")
    except json.JSONDecodeError as e:
        fail(f"Invalid JSON input: {e}")

    action = req.get("action", "research")
    query = (req.get("query") or "").strip()
    country = (req.get("country") or "US").upper()
    timeframe = req.get("timeframe") or "today 12-m"
    geo = GEO_MAP.get(country, country)

    if not query:
        fail("query is required")

    try:
        from pytrends.request import TrendReq
    except ImportError:
        fail("pytrends not installed. Run: pip install pytrends")

    try:
        # hl/tz: English UI, UTC-ish; retries help with rate limits
        pytrends = TrendReq(hl="en-US", tz=0, retries=2, backoff_factor=0.4)
        pytrends.build_payload([query], cat=0, timeframe=timeframe, geo=geo, gprop="")

        iot = pytrends.interest_over_time()
        points: list[dict[str, Any]] = []
        if iot is not None and not iot.empty:
            col = query if query in iot.columns else iot.columns[0]
            for idx, row in iot.iterrows():
                if "isPartial" in iot.columns and bool(row.get("isPartial")):
                    continue
                points.append(
                    {
                        "date": idx.strftime("%Y-%m-%d"),
                        "interest": int(row[col]) if row[col] == row[col] else 0,
                    }
                )

        related_top: list[dict[str, Any]] = []
        related_rising: list[dict[str, Any]] = []
        try:
            related = pytrends.related_queries() or {}
            block = related.get(query) or next(iter(related.values()), {}) or {}
            top_df = block.get("top")
            rising_df = block.get("rising")
            if top_df is not None and not top_df.empty:
                for _, r in top_df.head(15).iterrows():
                    related_top.append(
                        {"query": str(r.get("query", "")), "value": int(r.get("value", 0) or 0)}
                    )
            if rising_df is not None and not rising_df.empty:
                for _, r in rising_df.head(15).iterrows():
                    val = r.get("value", 0)
                    # rising may be "Breakout" string
                    if isinstance(val, str) and val.lower() == "breakout":
                        num = 5000
                    else:
                        try:
                            num = int(val)
                        except (TypeError, ValueError):
                            num = 0
                    related_rising.append({"query": str(r.get("query", "")), "value": num})
        except Exception:
            # related queries often fail under rate limit; interest alone is still useful
            pass

        regions: list[dict[str, Any]] = []
        if action == "research":
            try:
                ibr = pytrends.interest_by_region(
                    resolution="COUNTRY", inc_low_vol=True, inc_geo_code=True
                )
                if ibr is not None and not ibr.empty:
                    col = query if query in ibr.columns else ibr.columns[0]
                    tmp = ibr[[col]].copy()
                    tmp.columns = ["interest"]
                    tmp = tmp.sort_values("interest", ascending=False).head(12)
                    for name, row in tmp.iterrows():
                        regions.append({"region": str(name), "interest": int(row["interest"])})
            except Exception:
                pass

        # small delay hint for batch callers
        time.sleep(0.2)

        print(
            json.dumps(
                {
                    "ok": True,
                    "provider": "google_trends",
                    "query": query,
                    "country": country,
                    "geo": geo,
                    "timeframe": timeframe,
                    "points": points,
                    "relatedTop": related_top,
                    "relatedRising": related_rising,
                    "regions": regions,
                }
            ),
            flush=True,
        )
    except Exception as e:
        fail(str(e))


if __name__ == "__main__":
    main()
