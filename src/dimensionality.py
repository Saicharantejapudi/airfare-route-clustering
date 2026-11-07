"""
Dimensionality Reduction Module.
Implements Principal Component Analysis (PCA), Scree analysis,
component loading interpretations, and 2D/3D coordinate transformations.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import joblib
import numpy as np
import pandas as pd
from sklearn.decomposition import PCA

class PCAManager:
    """
    Manages PCA fitting, projection, variance ratio tracking,
    and component loading inspection.
    """

    def __init__(self, n_components: int = 3, random_state: int = 42) -> None:
        self.n_components = n_components
        self.random_state = random_state
        self.pca: Optional[PCA] = None
        self.full_pca: Optional[PCA] = None
        self.explained_variance_ratio_: Optional[np.ndarray] = None
        self.cumulative_variance_ratio_: Optional[np.ndarray] = None
        self.feature_names: List[str] = []

    def fit(self, X: np.ndarray, feature_names: Optional[List[str]] = None) -> "PCAManager":
        """
        Fits PCA on the preprocessed feature matrix X.
        Also fits a full PCA to analyze the entire eigenspectrum for the Scree plot.
        """
        self.feature_names = feature_names or [f"Feature_{i}" for i in range(X.shape[1])]

        # Full PCA for Scree plot (up to min(n_samples, n_features, 20))
        max_comps = min(X.shape[0], X.shape[1], 20)
        self.full_pca = PCA(n_components=max_comps, random_state=self.random_state)
        self.full_pca.fit(X)

        # Truncated PCA for 2D/3D projections
        self.pca = PCA(n_components=self.n_components, random_state=self.random_state)
        self.pca.fit(X)

        self.explained_variance_ratio_ = self.pca.explained_variance_ratio_
        self.cumulative_variance_ratio_ = np.cumsum(self.explained_variance_ratio_)
        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        """Projects feature matrix into the low-dimensional PC coordinate plane."""
        if self.pca is None:
            raise RuntimeError("PCAManager has not been fitted.")
        return self.pca.transform(X)

    def fit_transform(self, X: np.ndarray, feature_names: Optional[List[str]] = None) -> np.ndarray:
        """Fits PCA and returns projected coordinates."""
        self.fit(X, feature_names=feature_names)
        return self.transform(X)

    def get_component_loadings(self, top_n: int = 5) -> Dict[str, pd.DataFrame]:
        """
        Retrieves dominant feature loadings for PC1 and PC2.
        Loadings indicate how strongly each feature contributes to each principal axis.
        """
        if self.pca is None or not self.feature_names:
            raise RuntimeError("PCAManager has not been fitted with feature names.")

        loadings = self.pca.components_  # shape: (n_components, n_features)
        n_features = min(len(self.feature_names), loadings.shape[1])
        feat_subset = self.feature_names[:n_features]

        results = {}
        for i in range(min(self.n_components, 3)):
            pc_name = f"PC{i+1}"
            pc_loadings = pd.Series(loadings[i, :n_features], index=feat_subset)
            top_pos = pc_loadings.nlargest(top_n)
            top_neg = pc_loadings.nsmallest(top_n)
            results[pc_name] = pd.DataFrame({
                "Feature": list(top_pos.index) + list(top_neg.index),
                "Loading": list(top_pos.values) + list(top_neg.values),
                "Direction": ["Positive"] * top_n + ["Negative"] * top_n
            })
        return results

    def get_scree_data(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Returns (individual_variance_ratios, cumulative_variance_ratios)
        for all components fitted in full_pca.
        """
        if self.full_pca is None:
            raise RuntimeError("PCAManager has not been fitted.")
        indiv = self.full_pca.explained_variance_ratio_
        cum = np.cumsum(indiv)
        return indiv, cum

    def save(self, filepath: Union[str, Path] = "outputs/models/pca_model.joblib") -> Path:
        """Serializes the fitted PCAManager instance via joblib."""
        target_path = Path(filepath)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, target_path)
        return target_path

    @classmethod
    def load(cls, filepath: Union[str, Path] = "outputs/models/pca_model.joblib") -> "PCAManager":
        """Loads a serialized PCAManager from disk."""
        target_path = Path(filepath)
        if not target_path.exists():
            raise FileNotFoundError(f"PCA model file not found at {target_path}")
        return joblib.load(target_path)

