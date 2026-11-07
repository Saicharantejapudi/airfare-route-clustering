"""
Clustering Algorithms and Distance Metric Comparison Module.
Implements K-Means (k=2..10), Euclidean vs Manhattan distance comparisons,
and Agglomerative Hierarchical Clustering with Ward linkage.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import joblib
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.spatial.distance import cdist
from sklearn.cluster import AgglomerativeClustering, KMeans

from src.metrics import evaluate_clustering, evaluate_partition_stability

class KMeansClusterer:
    """
    K-Means clustering manager. Fits models across k in [2, 10], tracks
    validation metrics, and provides serialization/inference methods.
    """

    def __init__(
        self,
        k_range: range = range(2, 11),
        random_state: int = 42,
        n_init: int = 10
    ) -> None:
        self.k_range = k_range
        self.random_state = random_state
        self.n_init = n_init
        self.models: Dict[int, KMeans] = {}
        self.metrics_df: Optional[pd.DataFrame] = None
        self.optimal_k: Optional[int] = None
        self.optimal_model: Optional[KMeans] = None

    def run_k_sweep(
        self,
        X: np.ndarray,
        sample_size_metrics: int = 10000
    ) -> pd.DataFrame:
        """
        Fits K-Means for each k in k_range, recording WCSS, Silhouette Score,
        and Davies-Bouldin Index.
        """
        records: List[Dict[str, Union[int, float]]] = []

        for k in self.k_range:
            km = KMeans(
                n_clusters=k,
                init='k-means++',
                n_init=self.n_init,
                random_state=self.random_state
            )
            labels = km.fit_predict(X)
            self.models[k] = km

            res = evaluate_clustering(
                X=X,
                labels=labels,
                wcss=km.inertia_,
                sample_size=sample_size_metrics,
                metric='euclidean',
                random_state=self.random_state
            )

            records.append({
                "k": k,
                "wcss": res["wcss"],
                "silhouette_score": res["silhouette_score"],
                "davies_bouldin_index": res["davies_bouldin_index"]
            })

        self.metrics_df = pd.DataFrame(records)
        return self.metrics_df

    def set_optimal_k(self, k: int) -> KMeans:
        """Sets the selected optimal k and stores the model reference."""
        if k not in self.models:
            raise ValueError(f"k={k} not found in trained models. Available: {list(self.models.keys())}")
        self.optimal_k = k
        self.optimal_model = self.models[k]
        return self.optimal_model

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predicts cluster memberships using the optimal model."""
        if self.optimal_model is None:
            raise RuntimeError("Optimal model has not been set or trained yet.")
        return self.optimal_model.predict(X)

    def save(self, filepath: Union[str, Path] = "outputs/models/kmeans_optimal.joblib") -> Path:
        """Serializes the optimal K-Means model to disk."""
        if self.optimal_model is None:
            raise RuntimeError("No optimal model selected to save.")
        target_path = Path(filepath)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.optimal_model, target_path)
        return target_path

    @classmethod
    def load(cls, filepath: Union[str, Path] = "outputs/models/kmeans_optimal.joblib") -> KMeans:
        """Loads a serialized K-Means model from disk."""
        target_path = Path(filepath)
        if not target_path.exists():
            raise FileNotFoundError(f"Model file not found at {target_path}")
        return joblib.load(target_path)


class DistanceMetricComparison:
    """
    Evaluates geometric sensitivity on mixed continuous-categorical spaces
    comparing Euclidean distance (L2 norm) vs. Manhattan distance (L1 norm / taxicab).
    """

    @staticmethod
    def compare_metrics(
        X: np.ndarray,
        labels: np.ndarray,
        sample_size: int = 10000,
        random_state: int = 42
    ) -> Dict[str, Any]:
        """
        Evaluates cluster quality and dispersion under both L2 and L1 distance metrics.
        """
        rng = np.random.RandomState(random_state)
        if X.shape[0] > sample_size:
            idx = rng.choice(X.shape[0], size=sample_size, replace=False)
            X_sub = X[idx]
            labels_sub = labels[idx]
        else:
            X_sub = X
            labels_sub = labels

        # Silhouette Scores under Euclidean vs Manhattan
        from sklearn.metrics import silhouette_score
        sil_euclidean = float(silhouette_score(X_sub, labels_sub, metric='euclidean'))
        sil_manhattan = float(silhouette_score(X_sub, labels_sub, metric='manhattan'))

        # Mean pairwise within-cluster distance under L2 vs L1
        unique_labels = np.unique(labels_sub)
        l2_within_dists = []
        l1_within_dists = []

        for c in unique_labels:
            cluster_pts = X_sub[labels_sub == c]
            if len(cluster_pts) > 1:
                # Subsample within cluster if large
                if len(cluster_pts) > 500:
                    c_idx = rng.choice(len(cluster_pts), size=500, replace=False)
                    cluster_pts = cluster_pts[c_idx]
                d_l2 = cdist(cluster_pts, cluster_pts, metric='euclidean')
                d_l1 = cdist(cluster_pts, cluster_pts, metric='cityblock')
                # Take upper triangle non-zero distances
                triu_idx = np.triu_indices_from(d_l2, k=1)
                l2_within_dists.extend(d_l2[triu_idx])
                l1_within_dists.extend(d_l1[triu_idx])

        return {
            "silhouette_euclidean_l2": round(sil_euclidean, 4),
            "silhouette_manhattan_l1": round(sil_manhattan, 4),
            "mean_within_cluster_l2": round(float(np.mean(l2_within_dists)), 4) if l2_within_dists else 0.0,
            "mean_within_cluster_l1": round(float(np.mean(l1_within_dists)), 4) if l1_within_dists else 0.0,
            "conclusion": (
                "Manhattan (L1) metric reflects taxicab distance along sparse orthogonal one-hot binary "
                "dimensions without squaring penalties, whereas Euclidean (L2) places disproportionate "
                "weight on continuous coordinate variances."
            )
        }


class HierarchicalClusterer:
    """
    Fits Agglomerative Hierarchical Clustering with Ward's minimum variance linkage
    on a representative sample, computes dendrogram linkage matrices, and validates
    partition stability against K-Means.
    """

    def __init__(
        self,
        n_clusters: int = 4,
        sample_size: int = 5000,
        random_state: int = 42
    ) -> None:
        self.n_clusters = n_clusters
        self.sample_size = sample_size
        self.random_state = random_state
        self.linkage_matrix: Optional[np.ndarray] = None
        self.sample_indices: Optional[np.ndarray] = None
        self.labels_: Optional[np.ndarray] = None

    def fit_sample(self, X: np.ndarray) -> "HierarchicalClusterer":
        """
        Samples a representative subset of X, computes Ward linkage, and fits
        AgglomerativeClustering.
        """
        rng = np.random.RandomState(self.random_state)
        n_samples = X.shape[0]

        if n_samples > self.sample_size:
            self.sample_indices = rng.choice(n_samples, size=self.sample_size, replace=False)
            X_sample = X[self.sample_indices]
        else:
            self.sample_indices = np.arange(n_samples)
            X_sample = X

        # Ward linkage using scipy
        self.linkage_matrix = linkage(X_sample, method='ward')

        # Fit sklearn AgglomerativeClustering
        agg = AgglomerativeClustering(n_clusters=self.n_clusters, linkage='ward')
        self.labels_ = agg.fit_predict(X_sample)
        return self

    def compare_with_kmeans(self, kmeans_labels: np.ndarray) -> Dict[str, float]:
        """
        Compares Agglomerative cluster labels on the sampled subset against
        K-Means labels using Adjusted Rand Index (ARI) and Normalized Mutual Information (NMI).
        """
        if self.labels_ is None or self.sample_indices is None:
            raise RuntimeError("Hierarchical model has not been fitted yet.")

        km_sub_labels = kmeans_labels[self.sample_indices]
        return evaluate_partition_stability(km_sub_labels, self.labels_)

