from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(
    title="HackNaRock API",
    description="Backend API for HackNaRock",
    version="0.1.0"
)


@app.get("/")
async def root() -> JSONResponse:
    """
    Root endpoint that returns a welcome message.
    
    Returns:
        JSONResponse: Welcome message with API info
    """
    return JSONResponse({
        "message": "Witaj w HackNaRock API!",
        "status": "ok",
        "version": "0.1.0"
    })


@app.get("/health")
async def health_check() -> JSONResponse:
    """
    Health check endpoint.
    
    Returns:
        JSONResponse: Health status
    """
    return JSONResponse({
        "status": "healthy"
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
