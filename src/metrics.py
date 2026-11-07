"""
Clustering Metrics and Evaluation Module.
Computes WCSS (Inertia), Silhouette Score with subsampling, Davies-Bouldin Index,
and distance-based dispersion metrics.
"""

from typing import Dict, Optional, Tuple, Union
import numpy as np
from sklearn.metrics import (
    adjusted_rand_score,
    davies_bouldin_score,
    normalized_mutual_info_score,
    silhouette_score
)

def compute_wcss(kmeans_model) -> float:
    """
    Returns the Within-Cluster Sum of Squares (Inertia) for a fitted K-Means model.
    """
    return float(kmeans_model.inertia_)

def compute_silhouette(
    X: np.ndarray,
    labels: np.ndarray,
    sample_size: int = 10000,
    metric: str = "euclidean",
    random_state: int = 42
) -> float:
    """
    Computes the Mean Silhouette Coefficient over all samples.
    Subsamples to `sample_size` if N > sample_size for computational tractability.

    Parameters
    ----------
    X : np.ndarray
        Feature matrix.
    labels : np.ndarray
        Cluster labels.
    sample_size : int
        Maximum number of samples to use in silhouette calculation.
    metric : str
        Distance metric ('euclidean', 'manhattan').
    random_state : int
        Seed for sampling.

    Returns
    -------
    float
        Silhouette coefficient in range [-1, 1].
    """
    n_samples = X.shape[0]
    n_unique_labels = len(np.unique(labels))
    if n_unique_labels < 2 or n_unique_labels >= n_samples:
        return 0.0

    if n_samples > sample_size:
        return float(
            silhouette_score(
                X,
                labels,
                metric=metric,
                sample_size=sample_size,
                random_state=random_state
            )
        )
    return float(silhouette_score(X, labels, metric=metric))

def compute_davies_bouldin(X: np.ndarray, labels: np.ndarray) -> float:
    """
    Computes the Davies-Bouldin Index (DBI).
    Lower scores indicate better clustering (higher between-cluster separation
    and lower within-cluster dispersion).
    """
    n_unique_labels = len(np.unique(labels))
    if n_unique_labels < 2:
        return float('nan')
    return float(davies_bouldin_score(X, labels))

def evaluate_clustering(
    X: np.ndarray,
    labels: np.ndarray,
    wcss: Optional[float] = None,
    sample_size: int = 10000,
    metric: str = "euclidean",
    random_state: int = 42
) -> Dict[str, float]:
    """
    Aggregates WCSS, Silhouette Score, and Davies-Bouldin Index into a single dictionary.
    """
    sil = compute_silhouette(
        X,
        labels,
        sample_size=sample_size,
        metric=metric,
        random_state=random_state
    )
    dbi = compute_davies_bouldin(X, labels)

    res: Dict[str, float] = {
        "silhouette_score": round(sil, 4),
        "davies_bouldin_index": round(dbi, 4)
    }
    if wcss is not None:
        res["wcss"] = round(wcss, 2)

    return res

def evaluate_partition_stability(
    labels_a: np.ndarray,
    labels_b: np.ndarray
) -> Dict[str, float]:
    """
    Compares two cluster assignments (e.g., K-Means vs Hierarchical)
    using Adjusted Rand Index (ARI) and Normalized Mutual Information (NMI).
    """
    ari = adjusted_rand_score(labels_a, labels_b)
    nmi = normalized_mutual_info_score(labels_a, labels_b)
    return {
        "adjusted_rand_index": round(float(ari), 4),
        "normalized_mutual_info": round(float(nmi), 4)
    }

