import asyncio
import json
import logging
import sys
from pipelines.training.orchestrator import pipeline_orchestrator

# Configure purely for stdout to feed back to the user
logging.basicConfig(level=logging.ERROR) 

async def main():
    try:
        # Run a single cycle
        result = await pipeline_orchestrator.run_pipeline_cycle()
        
        # Output the EXACT format the user requested
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"status": "failed", "error": str(e)}))

if __name__ == "__main__":
    asyncio.run(main())
