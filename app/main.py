from fastapi import FastAPI

try:
	from .routers.SimulationApi import router as simulation_router
	from .routers.UserApi import router as user_router
except ImportError:  # Allow running ``uvicorn main:app`` from the app folder
	from routers.SimulationApi import router as simulation_router
	from routers.UserApi import router as user_router


app = FastAPI(title="Finance Simulation API")


app.include_router(simulation_router)
app.include_router(user_router)
