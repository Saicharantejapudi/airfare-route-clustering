"""
Preprocessor Module.
Constructs scikit-learn ColumnTransformer pipeline for scaling numerical features
and encoding categorical route/airline attributes. Serializes transformers with joblib.
"""

from pathlib import Path
from typing import List, Optional, Tuple, Union
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

NUMERICAL_FEATURES: List[str] = ['duration', 'days_left', 'price']
CATEGORICAL_FEATURES: List[str] = [
    'airline',
    'source_city',
    'destination_city',
    'stops',
    'class',
    'departure_time'
]

class RoutePreprocessor:
    """
    Standard preprocessor for airline route pricing data.
    Scales numerical attributes with StandardScaler and encodes categorical
    attributes with OneHotEncoder(drop='first', sparse_output=False).
    """

    def __init__(
        self,
        num_cols: Optional[List[str]] = None,
        cat_cols: Optional[List[str]] = None
    ) -> None:
        self.num_cols = num_cols or NUMERICAL_FEATURES
        self.cat_cols = cat_cols or CATEGORICAL_FEATURES
        self.pipeline: Optional[ColumnTransformer] = None
        self.feature_names: List[str] = []

    def build_pipeline(self) -> ColumnTransformer:
        """Constructs the scikit-learn ColumnTransformer."""
        num_transformer = StandardScaler()
        cat_transformer = OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore')

        pipeline = ColumnTransformer(
            transformers=[
                ('num', num_transformer, self.num_cols),
                ('cat', cat_transformer, self.cat_cols)
            ],
            remainder='drop'
        )
        return pipeline

    def fit(self, df: pd.DataFrame) -> "RoutePreprocessor":
        """Fits the ColumnTransformer on the dataset."""
        self.pipeline = self.build_pipeline()
        self.pipeline.fit(df)
        self._extract_feature_names()
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        """Transforms the dataset into a scaled and encoded dense numpy array."""
        if self.pipeline is None:
            raise RuntimeError("RoutePreprocessor must be fitted before calling transform.")
        return self.pipeline.transform(df)

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        """Fits to data, then transforms it."""
        self.pipeline = self.build_pipeline()
        arr = self.pipeline.fit_transform(df)
        self._extract_feature_names()
        return arr

    def _extract_feature_names(self) -> None:
        """Extracts transformed column names."""
        if self.pipeline is None:
            return
        cat_ohe: OneHotEncoder = self.pipeline.named_transformers_['cat']
        cat_features = list(cat_ohe.get_feature_names_out(self.cat_cols))
        self.feature_names = self.num_cols + cat_features

    def get_scaler(self) -> StandardScaler:
        """Retrieves the fitted StandardScaler instance."""
        if self.pipeline is None:
            raise RuntimeError("Pipeline is not fitted yet.")
        return self.pipeline.named_transformers_['num']

    def inverse_transform_numerical(self, scaled_num_values: np.ndarray) -> np.ndarray:
        """
        Inverts scaling for numerical columns (duration, days_left, price)
        to recover real-world units (hours, days, INR).
        """
        scaler = self.get_scaler()
        return scaler.inverse_transform(scaled_num_values)

    def save(self, filepath: Union[str, Path] = "outputs/models/preprocessor.joblib") -> Path:
        """Serializes the fitted RoutePreprocessor instance via joblib."""
        target_path = Path(filepath)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self, target_path)
        return target_path

    @classmethod
    def load(cls, filepath: Union[str, Path] = "outputs/models/preprocessor.joblib") -> "RoutePreprocessor":
        """Loads a serialized RoutePreprocessor instance from disk."""
        target_path = Path(filepath)
        if not target_path.exists():
            raise FileNotFoundError(f"Preprocessor file not found at {target_path}")
        return joblib.load(target_path)

