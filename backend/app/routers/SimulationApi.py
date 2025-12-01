from fastapi import APIRouter

try:
    from ..models.SimulationReq import SimulationRequest
    from ..services.SimulationService import simulate_financial_plan
except ImportError:  # Allow running without package context
    from models.SimulationReq import SimulationRequest  # type: ignore
    from services.SimulationService import simulate_financial_plan  # type: ignore


router = APIRouter(tags=["simulation"])


@router.post("/simulate")
def simulate(request: SimulationRequest):
    return simulate_financial_plan(request)
