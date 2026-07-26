from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


DatasetName = Literal["mock", "synthetic", "all"]


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Free-text OSINT query")
    dataset: DatasetName = Field(default="all")
    limit: int = Field(default=5, ge=1, le=20)


class InvestigationRequest(BaseModel):
    brief: str = Field(..., min_length=3, description="Narrative or case prompt")
    case_id: str | None = Field(default=None)
    dataset: DatasetName = Field(default="all")


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    available_datasets: list[str]


class DatabaseCollectionSummary(BaseModel):
    collection: str
    records: int
    description: str


class DatasetSummary(BaseModel):
    dataset: str
    collections: list[DatabaseCollectionSummary]


class EvaluationStep(BaseModel):
    name: str
    status: str
    details: str


class SearchMatch(BaseModel):
    record_id: str
    dataset: str
    title: str
    summary: str
    score: float
    source_name: str
    source_type: str
    published_at: str
    evidence_ref: str


class EvidenceReference(BaseModel):
    evidence_id: str
    dataset: str
    type: str
    description: str
    collected_at: str
    reference_url: str

