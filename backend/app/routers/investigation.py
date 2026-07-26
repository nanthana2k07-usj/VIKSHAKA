from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter

from backend.app.engines.repositories import get_investigation_cases, list_database_summaries, score_text_match
from backend.app.models.schemas import InvestigationRequest


router = APIRouter(prefix="/api/v1/investigation", tags=["investigation"])


@router.get("/databases")
def get_investigation_databases():
    return {
        "mode": "criminal_investigation",
        "databases": [summary.model_dump() for summary in list_database_summaries()],
    }


def _select_case(case_id: str | None, brief: str, dataset: str):
    cases = get_investigation_cases(dataset)

    if case_id:
        for case in cases:
            if case["case_id"].lower() == case_id.lower():
                return case

    ranked = []
    for case in cases:
        score = score_text_match(
            brief,
            [
                case["case_id"],
                case["fir_number"],
                case["title"],
                case["summary"],
                case["location"],
                case["incident_type"],
                " ".join(person["name"] for person in case.get("persons", [])),
                " ".join(person.get("role", "") for person in case.get("persons", [])),
                " ".join(link for link in case.get("linked_cases", [])),
            ],
        )
        if score > 0:
            ranked.append((score, case))

    ranked.sort(key=lambda item: item[0], reverse=True)
    return ranked[0][1] if ranked else None


@router.post("")
def run_investigation(request: InvestigationRequest):
    case = _select_case(request.case_id, request.brief, request.dataset)

    if not case:
        return {
            "request_id": str(uuid4()),
            "mode": "criminal_investigation",
            "dataset_used": [],
            "matched_case": None,
            "entities": [],
            "relationships": [],
            "legal_mapping": [],
            "evidence_references": [],
            "recommendations": [
                "Provide a case ID or more distinctive incident details.",
                "Switch datasets if you want only mock or only synthetic cases.",
            ],
            "summary": "No investigation case matched the supplied brief.",
        }

    entity_cards = []
    for person in case.get("persons", []):
        entity_cards.append(
            {
                "entity_id": person["id"],
                "entity_type": "person",
                "name": person["name"],
                "role": person["role"],
                "aliases": person.get("aliases", []),
            }
        )
    for location in case.get("locations", []):
        entity_cards.append(
            {
                "entity_id": location["id"],
                "entity_type": "location",
                "name": location["name"],
                "role": location["role"],
                "aliases": [],
            }
        )

    evidence_references = [
        {
            "evidence_id": evidence["id"],
            "dataset": case["dataset"],
            "type": evidence["type"],
            "description": evidence["description"],
            "collected_at": evidence["collected_at"],
            "reference_url": evidence["reference_url"],
        }
        for evidence in case.get("evidence", [])
    ]

    recommendations = [
        f"Prioritize evidence preservation for {len(evidence_references)} collected artifacts.",
        "Cross-check linked cases for shared entities and recurring modus operandi.",
        "Review legal mapping before finalizing the FIR draft.",
    ]

    return {
        "request_id": str(uuid4()),
        "mode": "criminal_investigation",
        "dataset_used": [case["dataset"]],
        "matched_case": {
            "case_id": case["case_id"],
            "fir_number": case["fir_number"],
            "title": case["title"],
            "status": case["status"],
            "summary": case["summary"],
            "officer": case["officer"],
        },
        "entities": entity_cards,
        "relationships": case.get("relationships", []),
        "modus_operandi": case.get("mo_pattern"),
        "legal_mapping": case.get("legal_mapping", []),
        "fir_draft": case.get("fir_draft", {}),
        "linked_cases": case.get("linked_cases", []),
        "timeline": case.get("timeline", []),
        "evidence_references": evidence_references,
        "recommendations": recommendations,
        "summary": f"Matched investigation case {case['case_id']} from the {case['dataset']} dataset.",
    }

