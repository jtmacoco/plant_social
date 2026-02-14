from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
import uvicorn
origins = [
    "http://localhost:8080"
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return("Hello World")

#Just to test stuff out
#if __name__ == "__main__":
#    uvicorn.run("main:app",reload=True,port=8080)

