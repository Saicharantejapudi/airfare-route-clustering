"""
Data Loader and Cleaning Module.
Responsible for ingesting raw flight price records, verifying data hygiene,
treating outliers, and preparing the canonical feature subset.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

REQUIRED_FEATURES: List[str] = [
    'airline',
    'source_city',
    'departure_time',
    'stops',
    'arrival_time',
    'destination_city',
    'class',
    'duration',
    'days_left',
    'price'
]

def load_raw_data(filepath: Union[str, Path] = "data/raw/Clean_Dataset.csv") -> pd.DataFrame:
    """
    Ingests the raw Kaggle Flight Price dataset from disk.

    Parameters
    ----------
    filepath : Union[str, Path]
        Path to the Clean_Dataset.csv file.

    Returns
    -------
    pd.DataFrame
        Raw flight price records dataframe.
    """
    path = Path(filepath)
    if not path.exists():
        # Fallback to check Data/Clean_Dataset.csv if path is data/raw/
        alt_path = Path("Data/Clean_Dataset.csv")
        if alt_path.exists():
            path = alt_path
        else:
            raise FileNotFoundError(f"Dataset not found at {filepath} or {alt_path}")

    df = pd.read_csv(path)
    return df

def detect_outliers_iqr(
    df: pd.DataFrame,
    column: str = "price",
    multiplier: float = 1.5
) -> Tuple[float, float, int]:
    """
    Calculates IQR boundary thresholds and counts the number of detected outliers.

    Parameters
    ----------
    df : pd.DataFrame
        Input dataframe.
    column : str
        Target numeric column to analyze.
    multiplier : float
        IQR threshold multiplier (default 1.5).

    Returns
    -------
    Tuple[float, float, int]
        (lower_bound, upper_bound, outlier_count)
    """
    q1 = df[column].quantile(0.25)
    q3 = df[column].quantile(0.75)
    iqr = q3 - q1
    lower_bound = max(0.0, float(q1 - multiplier * iqr))
    upper_bound = float(q3 + multiplier * iqr)
    outlier_count = int(((df[column] < lower_bound) | (df[column] > upper_bound)).sum())
    return lower_bound, upper_bound, outlier_count

def clean_dataset(
    df: pd.DataFrame,
    treat_outliers: bool = False,
    outlier_method: str = "iqr"
) -> pd.DataFrame:
    """
    Cleans flight records, drops index artifacts, validates required features,
    and applies optional outlier treatment.

    Parameters
    ----------
    df : pd.DataFrame
        Raw input dataframe.
    treat_outliers : bool
        Whether to filter extreme pricing outliers.
    outlier_method : str
        Method for outlier treatment ('iqr' or 'zscore').

    Returns
    -------
    pd.DataFrame
        Cleaned dataframe matching REQUIRED_FEATURES.
    """
    clean_df = df.copy()

    # Drop index artifacts if present
    drop_candidates = [col for col in ['Unnamed: 0', 'flight'] if col in clean_df.columns]
    if drop_candidates:
        clean_df = clean_df.drop(columns=drop_candidates)

    # Validate presence of required features
    missing_cols = [col for col in REQUIRED_FEATURES if col not in clean_df.columns]
    if missing_cols:
        raise ValueError(f"Dataset missing required columns: {missing_cols}")

    clean_df = clean_df[REQUIRED_FEATURES].copy()

    # Handle missing values if any
    clean_df = clean_df.dropna().reset_index(drop=True)

    # Optional outlier treatment
    if treat_outliers:
        if outlier_method == "iqr":
            lower, upper, _ = detect_outliers_iqr(clean_df, column="price", multiplier=1.5)
            clean_df = clean_df[(clean_df['price'] >= lower) & (clean_df['price'] <= upper)].reset_index(drop=True)
        elif outlier_method == "zscore":
            mean_val = clean_df['price'].mean()
            std_val = clean_df['price'].std()
            z_scores = np.abs((clean_df['price'] - mean_val) / std_val)
            clean_df = clean_df[z_scores <= 3.0].reset_index(drop=True)

    return clean_df

def get_data_summary(df: pd.DataFrame) -> Dict[str, Union[int, Dict]]:
    """
    Generates a structural summary of the dataframe for logging and validation.
    """
    lower_iqr, upper_iqr, n_outliers = detect_outliers_iqr(df, "price")
    return {
        "total_records": len(df),
        "columns": list(df.columns),
        "missing_values": df.isnull().sum().to_dict(),
        "price_summary": {
            "min": float(df['price'].min()),
            "max": float(df['price'].max()),
            "mean": float(df['price'].mean()),
            "median": float(df['price'].median()),
            "iqr_lower_bound": lower_iqr,
            "iqr_upper_bound": upper_iqr,
            "outliers_detected": n_outliers,
        }
    }

