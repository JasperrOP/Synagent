from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Import the main logic from your existing pipeline or agents file
# Replace 'run_research_pipeline' with the actual function name you use to start the agent
from pipeline import run_research_pipeline 

app = FastAPI()

# Allow your React app to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected request body
class ResearchRequest(BaseModel):
    prompt: str

@app.post("/api/research")
async def handle_research(request: ResearchRequest):
    # Pass the user's prompt into your LangChain multi-agent system
    agent_output = run_research_pipeline(request.prompt)
    
    return {"status": "success", "result": agent_output}