"""
Pipeline Runner.
Executes the full end-to-end machine learning pipeline:
1. Data loading and validation.
2. Preprocessing & transformer serialization.
3. K-Means hyperparameter sweep (k=2..10).
4. Distance metric evaluation (Euclidean vs Manhattan).
5. Agglomerative Hierarchical Clustering comparison.
6. PCA dimensionality reduction and loadings extraction.
7. Publication figure generation (300 DPI).
8. Model serialization and cluster archetyping.
"""

from pathlib import Path
import json
import numpy as np
import pandas as pd

from src.data_loader import clean_dataset, get_data_summary, load_raw_data
from src.preprocessor import RoutePreprocessor
from src.clustering import DistanceMetricComparison, HierarchicalClusterer, KMeansClusterer
from src.dimensionality import PCAManager
from src.visualization import (
    plot_cluster_centroids_profile,
    plot_davies_bouldin_index,
    plot_elbow_curve,
    plot_hierarchical_dendrogram,
    plot_pca_2d_clusters,
    plot_pca_scree,
    plot_silhouette_curve
)

def run_full_pipeline(
    raw_data_path: str = "data/raw/Clean_Dataset.csv",
    sample_for_clustering_sweep: int = 50000,
    optimal_k: int = 4
) -> dict:
    print("=" * 70)
    print("STARTING END-TO-END AIRFARE ROUTE CLUSTERING PIPELINE")
    print("=" * 70)

    # 1. Load and clean data
    print("\n[Step 1/8] Ingesting and cleaning raw data...")
    raw_df = load_raw_data(raw_data_path)
    print(f"Raw records loaded: {len(raw_df):,}")
    clean_df = clean_dataset(raw_df, treat_outliers=False)
    summary = get_data_summary(clean_df)
    print(f"Cleaned records: {len(clean_df):,}")
    print(f"Features: {clean_df.columns.tolist()}")

    # 2. Preprocessing Pipeline
    print("\n[Step 2/8] Fitting RoutePreprocessor (StandardScaler + OneHotEncoder)...")
    preprocessor = RoutePreprocessor()
    X_processed = preprocessor.fit_transform(clean_df)
    print(f"Preprocessed feature matrix shape: {X_processed.shape}")
    preproc_path = preprocessor.save("outputs/models/preprocessor.joblib")
    print(f"Saved preprocessor to: {preproc_path}")

    # Subsample for K-Means sweep if dataset is very large (> 50,000) for faster evaluation
    if len(clean_df) > sample_for_clustering_sweep:
        print(f"\nSubsampling {sample_for_clustering_sweep:,} instances for multi-k evaluation...")
        rng = np.random.RandomState(42)
        sweep_idx = rng.choice(len(clean_df), size=sample_for_clustering_sweep, replace=False)
        X_sweep = X_processed[sweep_idx]
    else:
        X_sweep = X_processed

    # 3. K-Means Sweep across k in [2, 10]
    print("\n[Step 3/8] Executing K-Means sweep (k=2 to 10)...")
    km_clusterer = KMeansClusterer(k_range=range(2, 11), random_state=42, n_init=10)
    metrics_df = km_clusterer.run_k_sweep(X_sweep, sample_size_metrics=10000)
    print("\nClustering Validation Metrics Table:")
    print(metrics_df.to_string(index=False))

    # Save metrics to outputs/
    metrics_path = Path("outputs/clustering_metrics.csv")
    metrics_df.to_csv(metrics_path, index=False)
    print(f"Saved metrics table to {metrics_path}")

    # Select optimal k and fit on full dataset (or sweep set)
    print(f"\nSelecting optimal k = {optimal_k}...")
    # Train optimal model on full processed data
    from sklearn.cluster import KMeans
    optimal_kmeans = KMeans(n_clusters=optimal_k, init='k-means++', n_init=10, random_state=42)
    labels_full = optimal_kmeans.fit_predict(X_processed)
    km_clusterer.optimal_k = optimal_k
    km_clusterer.optimal_model = optimal_kmeans
    model_path = km_clusterer.save("outputs/models/kmeans_optimal.joblib")
    print(f"Saved optimal K-Means model to {model_path}")

    # 4. Distance Metric Comparison (Euclidean vs Manhattan)
    print("\n[Step 4/8] Evaluating Euclidean (L2) vs Manhattan (L1) distance properties...")
    dist_comparison = DistanceMetricComparison.compare_metrics(
        X_processed, labels_full, sample_size=10000, random_state=42
    )
    print("Distance Metric Comparison Results:")
    for k_metric, v_metric in dist_comparison.items():
        print(f"  - {k_metric}: {v_metric}")

    # 5. Hierarchical Clustering Comparison
    print("\n[Step 5/8] Performing Hierarchical Agglomerative Clustering (Ward Linkage)...")
    hierarchical = HierarchicalClusterer(n_clusters=optimal_k, sample_size=4000, random_state=42)
    hierarchical.fit_sample(X_processed)
    stability = hierarchical.compare_with_kmeans(labels_full)
    print(f"Hierarchical vs K-Means Partition Stability on Sample:")
    print(f"  - Adjusted Rand Index (ARI): {stability['adjusted_rand_index']}")
    print(f"  - Normalized Mutual Information (NMI): {stability['normalized_mutual_info']}")

    # 6. PCA Dimensionality Reduction
    print("\n[Step 6/8] Fitting PCA dimensionality reduction...")
    pca_manager = PCAManager(n_components=3, random_state=42)
    pca_manager.fit(X_processed, feature_names=preprocessor.feature_names)
    pca_2d = pca_manager.transform(X_processed[:15000])  # Sample for visualization
    labels_vis = labels_full[:15000]
    pca_model_path = pca_manager.save("outputs/models/pca_model.joblib")
    print(f"Saved PCA model to {pca_model_path}")

    indiv_var, cum_var = pca_manager.get_scree_data()
    print(f"PCA Top 3 Components Explained Variance: {pca_manager.explained_variance_ratio_}")
    print(f"PCA Cumulative Variance (3 comps): {cum_var[2]:.4f}")

    loadings = pca_manager.get_component_loadings(top_n=4)
    print("\nPCA Component 1 Loadings:")
    print(loadings['PC1'].to_string(index=False))
    print("\nPCA Component 2 Loadings:")
    print(loadings['PC2'].to_string(index=False))

    # 7. Cluster Centroids De-standardization and Profiling
    print("\n[Step 7/8] De-standardizing cluster centroids and profiling archetypes...")
    clean_df['cluster'] = labels_full

    # Numerical feature means per cluster
    centroid_summary = clean_df.groupby('cluster')[['price', 'duration', 'days_left']].mean().reset_index()

    # Commercial archetype mapping based on domain attributes
    archetype_map = {}
    for idx, row in centroid_summary.iterrows():
        c_id = int(row['cluster'])
        p = row['price']
        d = row['duration']
        lead = row['days_left']

        if p > 35000:
            if lead < 10:
                name = "Last-Minute Business & Premium Route"
            else:
                name = "Advance Business Class Corridor"
        else:
            if d > 12:
                name = "Long-Haul Multi-Stop Economy Route"
            elif lead > 25:
                name = "Budget Advance-Booking Leisure Route"
            elif lead < 7:
                name = "Urgent Short-Notice Economy Commute"
            else:
                name = "Standard Mid-Range Economy Corridor"
        archetype_map[c_id] = f"Cluster {c_id}: {name}"

    centroid_summary['cluster_name'] = centroid_summary['cluster'].map(archetype_map)
    print("\nDe-standardized Centroid Profiles:")
    print(centroid_summary[['cluster', 'cluster_name', 'price', 'duration', 'days_left']])

    # 8. Publication Figures Generation
    print("\n[Step 8/8] Rendering and saving publication figures (300 DPI)...")
    k_vals = list(metrics_df['k'])
    wcss_vals = list(metrics_df['wcss'])
    sil_vals = list(metrics_df['silhouette_score'])
    dbi_vals = list(metrics_df['davies_bouldin_index'])

    f1 = plot_elbow_curve(k_vals, wcss_vals, optimal_k=optimal_k)
    f2 = plot_silhouette_curve(k_vals, sil_vals, optimal_k=optimal_k)
    f3 = plot_davies_bouldin_index(k_vals, dbi_vals, optimal_k=optimal_k)
    f4 = plot_hierarchical_dendrogram(hierarchical.linkage_matrix, p=30)
    f5 = plot_pca_2d_clusters(pca_2d, labels_vis, cluster_names=archetype_map)
    f6 = plot_pca_scree(indiv_var, cum_var, max_components=15)
    f7 = plot_cluster_centroids_profile(centroid_summary)

    print("Figures successfully generated:")
    for f in [f1, f2, f3, f4, f5, f6, f7]:
        print(f"  - {f}")

    # Save summary metadata
    pipeline_results = {
        "dataset_records": len(clean_df),
        "optimal_k": optimal_k,
        "metrics": metrics_df.to_dict(orient='records'),
        "distance_comparison": dist_comparison,
        "hierarchical_stability": stability,
        "cluster_archetypes": archetype_map,
        "centroids": centroid_summary.to_dict(orient='records')
    }
    with open("outputs/pipeline_results.json", "w") as f:
        json.dump(pipeline_results, f, indent=2)

    # Save a lightweight processed dataset sample for web app fast loading
    processed_sample = clean_df.sample(n=min(10000, len(clean_df)), random_state=42)
    processed_sample.to_csv("data/processed/clean_sample.csv", index=False)
    print("Saved sample to data/processed/clean_sample.csv")

    print("\n" + "=" * 70)
    print("PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    return pipeline_results

if __name__ == "__main__":
    run_full_pipeline()

