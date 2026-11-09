"""
FastAPI Main Application.
Airfare Route Clustering REST Service.
Course: INT396 | Problem Statement: SIH26056
"""

from pathlib import Path
from typing import Any, Dict, List
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse, JSONResponse

from api.model_service import ModelService
from api.schemas import (
    CentroidProfile,
    DatasetSummaryResponse,
    FlightInferenceRequest,
    ModelMetricsResponse,
    PredictionResponse
)

app = FastAPI(
    title="Airfare Route Clustering API",
    description="REST Service providing unsupervised learning clustering, PCA dimensionality reduction, and real-time flight route inference for Problem Statement SIH26056.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local Vite development and deployed frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Model Service
service = ModelService(base_dir=Path("."))

@app.get("/api/v1/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    """Returns system status and model readiness."""
    return {
        "status": "healthy",
        "service": "Airfare Route Clustering API",
        "models_loaded": service.is_ready(),
        "optimal_k": 4,
        "academic_metadata": {
            "course": "INT396 - Unsupervised Learning",
            "problem_statement_id": "SIH26056",
            "student_reg_no": "12507339"
        }
    }

@app.get("/api/v1/dataset/summary", response_model=DatasetSummaryResponse, tags=["Dataset"])
def get_dataset_summary():
    """Returns structural dataset summaries, distributions, and feature specifications."""
    return service.get_dataset_summary()

@app.get("/api/v1/metrics/k-sweep", tags=["Clustering Diagnostics"])
def get_k_sweep_metrics() -> Dict[str, Any]:
    """Returns WCSS, Silhouette Score, and Davies-Bouldin metrics across k=2..10."""
    return service.get_metrics()

@app.get("/api/v1/metrics/dbscan-anomalies", tags=["Clustering Diagnostics"])
def get_dbscan_anomalies() -> Dict[str, Any]:
    """Returns DBSCAN density anomaly metrics, noise counts, and price gouging statistics."""
    metrics = service.get_metrics()
    return metrics.get("dbscan_anomalies", {})

@app.get("/api/v1/clusters/centroids", response_model=List[CentroidProfile], tags=["Cluster Profiles"])
def get_cluster_centroids():
    """Returns de-standardized real-world cluster centroid profiles and commercial archetypes."""
    return service.get_centroids()

@app.get("/api/v1/pca/projections", tags=["Dimensionality Reduction"])
def get_pca_projections(limit: int = 1000) -> Dict[str, Any]:
    """Returns 2D and 3D PCA coordinates and cluster assignments for visual scatter plots."""
    return service.get_pca_sample(limit=limit)

@app.post("/api/v1/predict/route-cluster", response_model=PredictionResponse, tags=["Inference"])
def predict_route_cluster(request: FlightInferenceRequest):
    """
    Infers the cluster membership, commercial profile archetype,
    and 3D PCA coordinate mapping for any submitted flight itinerary.
    """
    try:
        return service.predict(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}"
        )

# Mount static frontend production build if available (Unified single-service support)
dist_dir = Path("frontend/dist")
if dist_dir.exists() and dist_dir.is_dir():
    @app.exception_handler(404)
    async def spa_fallback_404(request: Request, exc: Exception):
        path = request.url.path
        if path.startswith("/api/") or path.startswith("/docs") or path.startswith("/openapi.json") or path.startswith("/redoc"):
            return JSONResponse(status_code=404, content={"detail": f"Path '{path}' not found"})
        index_file = dist_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Not Found"})

    app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="static_frontend")

