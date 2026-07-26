from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from backend.app.models.schemas import DatasetSummary


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
DATASETS = ("mock", "synthetic")


def _dataset_names(dataset: str) -> list[str]:
    if dataset == "all":
        return list(DATASETS)
    if dataset not in DATASETS:
        raise ValueError(f"Unsupported dataset: {dataset}")
    return [dataset]


@lru_cache(maxsize=8)
def _load_json(path: str) -> list[dict[str, Any]]:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def load_collection(dataset: str, collection: str) -> list[dict[str, Any]]:
    return _load_json(str(DATA_DIR / dataset / f"{collection}.json"))


def list_database_summaries() -> list[DatasetSummary]:
    summaries: list[DatasetSummary] = []
    descriptions = {
        "search_records": "OSINT-style article, bulletin, and scenario documents.",
        "investigation_cases": "Case dossiers with entities, evidence, and legal mapping.",
    }

    for dataset in DATASETS:
        collections = []
        for collection, description in descriptions.items():
            records = len(load_collection(dataset, collection))
            collections.append(
                {
                    "collection": collection,
                    "records": records,
                    "description": description,
                }
            )
        summaries.append({"dataset": dataset, "collections": collections})

    return [DatasetSummary.model_validate(summary) for summary in summaries]


def get_search_records(dataset: str) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for dataset_name in _dataset_names(dataset):
        for item in load_collection(dataset_name, "search_records"):
            enriched = dict(item)
            enriched["dataset"] = dataset_name
            records.append(enriched)
    return records


def get_investigation_cases(dataset: str) -> list[dict[str, Any]]:
    cases: list[dict[str, Any]] = []
    for dataset_name in _dataset_names(dataset):
        for item in load_collection(dataset_name, "investigation_cases"):
            enriched = dict(item)
            enriched["dataset"] = dataset_name
            cases.append(enriched)
    return cases


def tokenize(text: str) -> list[str]:
    return [token for token in "".join(ch.lower() if ch.isalnum() else " " for ch in text).split() if token]


def score_text_match(query: str, values: list[str]) -> float:
    tokens = tokenize(query)
    if not tokens:
        return 0.0

    haystack = " ".join(values).lower()
    matched = sum(1 for token in tokens if token in haystack)
    return round(matched / len(tokens), 4)

