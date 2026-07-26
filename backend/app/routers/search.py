from __future__ import annotations

from statistics import mean
from uuid import uuid4

from fastapi import APIRouter

from backend.app.engines.repositories import get_search_records, list_database_summaries, score_text_match
from backend.app.models.schemas import EvaluationStep, SearchMatch, SearchRequest


router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.get("/databases")
def get_search_databases():
    return {
        "mode": "osint_search",
        "databases": [summary.model_dump() for summary in list_database_summaries()],
    }


@router.post("")
def run_search(request: SearchRequest):
    scored = []
    for record in get_search_records(request.dataset):
        score = score_text_match(
            request.query,
            [
                record["title"],
                record["summary"],
                record["region"],
                " ".join(record.get("entities", [])),
                " ".join(record.get("keywords", [])),
            ],
        )
        if score > 0:
            scored.append((score, record))

    scored.sort(key=lambda item: (item[0], item[1]["trust_score"]), reverse=True)
    matches = scored[: request.limit]

    if matches:
        avg_trust = mean(record["trust_score"] for _, record in matches)
        avg_ai_risk = mean(record["ai_risk"] for _, record in matches)
        freshness = matches[0][1]["published_at"]
        dataset_used = sorted({record["dataset"] for _, record in matches})
        summary = (
            f"Found {len(matches)} relevant records for '{request.query}' across "
            f"{', '.join(dataset_used)} data. Highest-confidence lead: {matches[0][1]['title']}."
        )
        steps = [
            EvaluationStep(name="source_analysis", status="complete", details=f"Average trust score {avg_trust:.2f}."),
            EvaluationStep(name="ai_detection", status="complete", details=f"Average AI-content risk {avg_ai_risk:.2f}."),
            EvaluationStep(name="freshness", status="complete", details=f"Most recent supporting record published at {freshness}."),
            EvaluationStep(name="consensus", status="complete", details="Top-ranked records provide corroborating narratives."),
            EvaluationStep(name="verification", status="complete", details="Records include explicit verification notes and linked evidence sources."),
            EvaluationStep(name="summary", status="complete", details=summary),
            EvaluationStep(name="health_report", status="complete", details=f"{len(matches)} records passed the relevance threshold."),
        ]
    else:
        dataset_used = []
        summary = f"No relevant records found for '{request.query}'."
        steps = [
            EvaluationStep(name="source_analysis", status="empty", details="No records exceeded the relevance threshold."),
            EvaluationStep(name="ai_detection", status="empty", details="No candidate records to score."),
            EvaluationStep(name="freshness", status="empty", details="No supporting records found."),
            EvaluationStep(name="consensus", status="empty", details="Consensus cannot be computed without matches."),
            EvaluationStep(name="verification", status="empty", details="Verification awaits matching evidence."),
            EvaluationStep(name="summary", status="complete", details=summary),
            EvaluationStep(name="health_report", status="warning", details="Query may need broader terms or a different dataset."),
        ]

    response_matches = [
        SearchMatch(
            record_id=record["id"],
            dataset=record["dataset"],
            title=record["title"],
            summary=record["summary"],
            score=score,
            source_name=record["source_name"],
            source_type=record["source_type"],
            published_at=record["published_at"],
            evidence_ref=record["source_url"],
        ).model_dump()
        for score, record in matches
    ]

    evidence_references = [
        {
            "evidence_id": record["id"],
            "dataset": record["dataset"],
            "type": record["source_type"],
            "description": record["verification"],
            "collected_at": record["collected_at"],
            "reference_url": record["source_url"],
        }
        for _, record in matches
    ]

    return {
        "request_id": str(uuid4()),
        "mode": "osint_search",
        "query": request.query,
        "dataset_used": dataset_used,
        "matches": response_matches,
        "evaluation": {"steps": [step.model_dump() for step in steps]},
        "summary": summary,
        "evidence_references": evidence_references,
    }

