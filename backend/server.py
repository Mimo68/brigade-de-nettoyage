from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models for the cleaning report
class CleaningReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # Basic information
    date: str
    site: str
    worker: str
    controlledBy: str
    
    # Hall entrances
    hallElevators: str
    hallGlassDoors: str
    hallMailboxes: str
    hallHoseReels: str
    hallCarpets: str
    hallComments: str
    hallPhoto: Optional[str] = None
    
    # Corridors
    corridorEdges: str
    corridorHoseReels: str
    corridorFloors: str
    corridorComments: str
    corridorPhoto: Optional[str] = None
    
    # Stairs
    stairRailings: str
    stairCorners: str
    stairSpiderWebs: str
    stairComments: str
    stairPhoto: Optional[str] = None
    
    # Technical skills
    techProcedures: str
    techMaterial: str
    techSafety: str
    techAutonomy: str
    
    # Professional behavior
    profPunctuality: str
    profAttitude: str
    profInstructions: str
    profMotivation: str
    
    # Global evaluation
    globalEvaluation: str
    workerSignature: str
    supervisorSignature: str
    
    # Status
    status: str = "submitted"
    emailSent: bool = False

class CleaningReportCreate(BaseModel):
    # Basic information
    date: str
    site: str
    worker: str
    controlledBy: str
    
    # Hall entrances
    hallElevators: str
    hallGlassDoors: str
    hallMailboxes: str
    hallHoseReels: str
    hallCarpets: str
    hallComments: str
    hallPhoto: Optional[str] = None
    
    # Corridors
    corridorEdges: str
    corridorHoseReels: str
    corridorFloors: str
    corridorComments: str
    corridorPhoto: Optional[str] = None
    
    # Stairs
    stairRailings: str
    stairCorners: str
    stairSpiderWebs: str
    stairComments: str
    stairPhoto: Optional[str] = None
    
    # Technical skills
    techProcedures: str
    techMaterial: str
    techSafety: str
    techAutonomy: str
    
    # Professional behavior
    profPunctuality: str
    profAttitude: str
    profInstructions: str
    profMotivation: str
    
    # Global evaluation
    globalEvaluation: str
    workerSignature: str
    supervisorSignature: str

# Original status check models (keeping for compatibility)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Brigade de Nettoyage API"}

@api_router.post("/cleaning-report", response_model=CleaningReport)
async def create_cleaning_report(report_data: CleaningReportCreate):
    """Create a new cleaning report"""
    try:
        # Convert to CleaningReport model
        report_dict = report_data.dict()
        report = CleaningReport(**report_dict)
        
        # Save to database
        result = await db.cleaning_reports.insert_one(report.dict())
        
        if result.inserted_id:
            # TODO: Send email notification to amiloudi@faah.be
            logger.info(f"Cleaning report created with ID: {report.id}")
            return report
        else:
            raise HTTPException(status_code=500, detail="Failed to create cleaning report")
            
    except Exception as e:
        logger.error(f"Error creating cleaning report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating cleaning report: {str(e)}")

@api_router.get("/cleaning-reports", response_model=List[CleaningReport])
async def get_cleaning_reports():
    """Get all cleaning reports"""
    try:
        reports = await db.cleaning_reports.find().sort("timestamp", -1).to_list(1000)
        return [CleaningReport(**report) for report in reports]
    except Exception as e:
        logger.error(f"Error fetching cleaning reports: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching cleaning reports: {str(e)}")

@api_router.get("/cleaning-report/{report_id}", response_model=CleaningReport)
async def get_cleaning_report(report_id: str):
    """Get a specific cleaning report by ID"""
    try:
        report = await db.cleaning_reports.find_one({"id": report_id})
        if report:
            return CleaningReport(**report)
        else:
            raise HTTPException(status_code=404, detail="Cleaning report not found")
    except Exception as e:
        logger.error(f"Error fetching cleaning report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching cleaning report: {str(e)}")

# Original status check routes (keeping for compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()