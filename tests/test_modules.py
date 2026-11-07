"""
Unit and Integration Tests for Airfare Route Clustering.
Verifies data loading, preprocessor transformations, clustering models,
metrics computations, and PCA dimensionality reduction.
"""

from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from src.data_loader import clean_dataset, detect_outliers_iqr
from src.preprocessor import RoutePreprocessor
from src.clustering import DistanceMetricComparison, HierarchicalClusterer, KMeansClusterer
from src.dimensionality import PCAManager
from src.metrics import evaluate_clustering, evaluate_partition_stability

@pytest.fixture
def sample_raw_data() -> pd.DataFrame:
    """Creates a synthetic flight dataset fixture for rapid testing."""
    return pd.DataFrame({
        'airline': ['SpiceJet', 'Air_India', 'Vistara', 'Indigo', 'GO_FIRST'] * 20,
        'source_city': ['Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai'] * 20,
        'departure_time': ['Morning', 'Evening', 'Night', 'Afternoon', 'Early_Morning'] * 20,
        'stops': ['zero', 'one', 'two_or_more', 'zero', 'one'] * 20,
        'arrival_time': ['Afternoon', 'Night', 'Morning', 'Evening', 'Late_Night'] * 20,
        'destination_city': ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Kolkata'] * 20,
        'class': ['Economy', 'Business', 'Economy', 'Economy', 'Business'] * 20,
        'duration': [2.5, 3.2, 12.0, 1.8, 15.5] * 20,
        'days_left': [1, 5, 20, 35, 45] * 20,
        'price': [5500, 48000, 7200, 3800, 52000] * 20
    })

def test_data_cleaning_and_iqr(sample_raw_data):
    clean_df = clean_dataset(sample_raw_data)
    assert len(clean_df) == 100
    lower, upper, outliers = detect_outliers_iqr(clean_df, 'price')
    assert lower >= 0
    assert upper > lower
    assert isinstance(outliers, int)

def test_route_preprocessor(sample_raw_data):
    preprocessor = RoutePreprocessor()
    X = preprocessor.fit_transform(sample_raw_data)
    assert X.ndim == 2
    assert X.shape[0] == 100
    assert len(preprocessor.feature_names) == X.shape[1]

    # Test inverse transform of numerical columns
    num_scaled = X[:, :3]
    num_orig = preprocessor.inverse_transform_numerical(num_scaled)
    assert np.allclose(num_orig[:, 0], sample_raw_data['duration'].values)

def test_kmeans_sweep_and_metrics(sample_raw_data):
    preprocessor = RoutePreprocessor()
    X = preprocessor.fit_transform(sample_raw_data)

    km_clusterer = KMeansClusterer(k_range=range(2, 5), random_state=42)
    metrics_df = km_clusterer.run_k_sweep(X, sample_size_metrics=100)
    assert len(metrics_df) == 3
    assert 'wcss' in metrics_df.columns
    assert 'silhouette_score' in metrics_df.columns
    assert 'davies_bouldin_index' in metrics_df.columns

    # Test setting optimal k and inference
    km_clusterer.set_optimal_k(3)
    preds = km_clusterer.predict(X)
    assert len(preds) == 100
    assert len(np.unique(preds)) <= 3

def test_distance_comparison(sample_raw_data):
    preprocessor = RoutePreprocessor()
    X = preprocessor.fit_transform(sample_raw_data)
    labels = np.array([0, 1, 0, 0, 1] * 20)

    res = DistanceMetricComparison.compare_metrics(X, labels, sample_size=100)
    assert 'silhouette_euclidean_l2' in res
    assert 'silhouette_manhattan_l1' in res
    assert res['mean_within_cluster_l1'] >= res['mean_within_cluster_l2']

def test_hierarchical_and_stability(sample_raw_data):
    preprocessor = RoutePreprocessor()
    X = preprocessor.fit_transform(sample_raw_data)
    km_labels = np.array([0, 1, 0, 0, 1] * 20)

    hierarchical = HierarchicalClusterer(n_clusters=2, sample_size=100, random_state=42)
    hierarchical.fit_sample(X)
    assert hierarchical.linkage_matrix is not None
    assert hierarchical.labels_ is not None

    stability = hierarchical.compare_with_kmeans(km_labels)
    assert 'adjusted_rand_index' in stability
    assert 'normalized_mutual_info' in stability

def test_pca_decomposition(sample_raw_data):
    preprocessor = RoutePreprocessor()
    X = preprocessor.fit_transform(sample_raw_data)

    pca = PCAManager(n_components=3, random_state=42)
    coords = pca.fit_transform(X, feature_names=preprocessor.feature_names)
    assert coords.shape == (100, 3)

    indiv, cum = pca.get_scree_data()
    assert len(indiv) > 0
    assert np.isclose(cum[-1], np.sum(indiv))

    loadings = pca.get_component_loadings(top_n=2)
    assert 'PC1' in loadings
    assert 'PC2' in loadings

