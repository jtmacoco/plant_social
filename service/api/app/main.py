from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
from .routes import images
import uvicorn

origins = [
    "http://localhost:8081",
    "http://localhost:19006",
    "http://localhost:8080",
    "http://10.250.81.211:8081",
    "http://10.250.81.211:19006",
    "*",  # Allow all origins in development
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(images.router)
@app.get("/")
async def read_root():
    return("Hello World")

#Just to test stuff out
#if __name__ == "__main__":
#    uvicorn.run("main:app",reload=True,port=8080)

