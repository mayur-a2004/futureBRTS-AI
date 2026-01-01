from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import asyncio

app = FastAPI(title='Futurebilder ML Worker')

class PredictRequest(BaseModel):
    user_id: str
    payload: dict

@app.get('/health')
async def health():
    return {'status': 'ok'}

@app.post('/predict')
async def predict(req: PredictRequest):
    # placeholder - replace with real model call
    return {'user_id': req.user_id, 'prediction': 'placeholder', 'score': 0.0}
    
if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8001)
