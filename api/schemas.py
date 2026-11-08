"""
Pydantic Schemas for Request & Response Validation.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class FlightInferenceRequest(BaseModel):
    airline: str = Field(..., example="Vistara")
    source_city: str = Field(..., example="Delhi")
    destination_city: str = Field(..., example="Mumbai")
    departure_time: str = Field("Morning", example="Morning")
    stops: str = Field("zero", example="zero")
    travel_class: str = Field("Economy", example="Economy")
    duration: float = Field(2.5, ge=0.5, le=50.0, example=2.5)
    days_left: int = Field(15, ge=1, le=60, example=15)
    price: float = Field(5500.0, ge=500.0, le=200000.0, example=5500.0)

class PCACoordinates(BaseModel):
    pc1: float
    pc2: float
    pc3: float

class PredictionResponse(BaseModel):
    # Consumer & Passenger Decision Fields (Zero-Jargon)
    deal_verdict: str
    deal_score: float = Field(..., ge=1.0, le=10.0)
    deal_badge: str
    badge_color: str
    actionable_tip: str
    savings_estimate: str
    
    # Academic & Technical Machine Learning Fields (INT396 / SIH26056)
    cluster_id: int
    cluster_name: str
    archetype: str
    fare_sensitivity: str
    pca_coordinates: PCACoordinates
    operational_profile: str
    key_drivers: List[str]
    confidence_pct: Optional[float] = Field(None, example=84.2)
    centroid_distance: Optional[float] = Field(None, example=2.13)
    secondary_cluster: Optional[str] = Field(None, example="Cluster 0: Standard Planned Economy (78.2% proximity)")

class CentroidProfile(BaseModel):
    cluster: int
    cluster_name: str
    archetype: str
    badge: str
    price: float
    duration: float
    days_left: float
    typical_stops: str
    description: str

class DatasetSummaryResponse(BaseModel):
    total_records: int
    features: List[str]
    airlines: List[str]
    cities: List[str]
    median_price: float
    avg_lead_time: float
    avg_duration: float

class MetricSweepItem(BaseModel):
    k: int
    wcss: float
    silhouette_score: float
    davies_bouldin_index: float

class ModelMetricsResponse(BaseModel):
    optimal_k: int
    k_sweep: List[MetricSweepItem]
    distance_comparison: Dict[str, Any]
    hierarchical_stability: Dict[str, Any]
    explained_variance_ratio: List[float]
    cumulative_variance: float

