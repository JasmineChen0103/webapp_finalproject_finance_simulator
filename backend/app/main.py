from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
	from .routers.SimulationApi import router as simulation_router
	from .routers.UserApi import router as user_router
	from .routers.FinancialSettingApi import router as financial_setting_router
except ImportError:  # Allow running ``uvicorn main:app`` from the app folder
	from routers.SimulationApi import router as simulation_router
	from routers.UserApi import router as user_router
	from routers.FinancialSettingApi import router as financial_setting_router


app = FastAPI(title="Finance Simulation API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          
    allow_credentials=True,
    allow_methods=["*"],          
    allow_headers=["*"],
)


app.include_router(simulation_router)
app.include_router(user_router)
app.include_router(financial_setting_router)
