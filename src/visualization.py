"""
Visualization Module.
Generates publication-quality charts (300 DPI) for clustering diagnostics,
dimensionality reduction projections, dendrograms, and profile comparisons.
"""

from pathlib import Path
from typing import Dict, List, Optional, Union
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import dendrogram
import seaborn as sns

# Set publication styling
plt.style.use('seaborn-v0_8-whitegrid')
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['figure.autolayout'] = True
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10

FIGURES_DIR = Path("outputs/figures")

def save_fig(fig: plt.Figure, filename: str, dpi: int = 300) -> Path:
    """Helper to save a figure with directory creation and tight bounding box."""
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    out_path = FIGURES_DIR / filename
    fig.savefig(out_path, dpi=dpi, bbox_inches='tight')
    plt.close(fig)
    return out_path

def plot_elbow_curve(
    k_values: List[int],
    wcss_values: List[float],
    optimal_k: Optional[int] = 4,
    filename: str = "01_elbow_wcss_curve.png"
) -> Path:
    """
    Plots the Within-Cluster Sum of Squares (Inertia) vs Number of Clusters k.
    Annotates the identified elbow point.
    """
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(k_values, wcss_values, marker='o', markersize=8, color='#1f77b4', linewidth=2.5, label='WCSS')

    if optimal_k is not None and optimal_k in k_values:
        opt_idx = k_values.index(optimal_k)
        opt_wcss = wcss_values[opt_idx]
        ax.scatter([optimal_k], [opt_wcss], color='#d62728', s=160, zorder=5, label=f'Optimal k = {optimal_k}')
        ax.annotate(
            f'Elbow Inflection (k={optimal_k})\nWCSS = {opt_wcss:,.0f}',
            xy=(optimal_k, opt_wcss),
            xytext=(optimal_k + 0.6, opt_wcss * 1.08),
            arrowprops=dict(facecolor='#d62728', shrink=0.08, width=1.5, headwidth=8),
            fontweight='bold',
            color='#d62728',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#ffebee', edgecolor='#d62728', alpha=0.8)
        )

    ax.set_title("K-Means Elbow Method: WCSS vs. Number of Clusters (k)", fontsize=14, pad=12, fontweight='bold')
    ax.set_xlabel("Number of Clusters (k)", fontsize=12)
    ax.set_ylabel("Within-Cluster Sum of Squares (Inertia)", fontsize=12)
    ax.set_xticks(k_values)
    ax.grid(True, linestyle='--', alpha=0.6)
    ax.legend(frameon=True)
    return save_fig(fig, filename)

def plot_silhouette_curve(
    k_values: List[int],
    silhouette_scores: List[float],
    optimal_k: Optional[int] = 4,
    filename: str = "02_silhouette_scores.png"
) -> Path:
    """
    Plots Silhouette Score across k and highlights the optimal cluster count.
    """
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(k_values, silhouette_scores, marker='s', markersize=8, color='#2ca02c', linewidth=2.5, label='Silhouette Score')

    if optimal_k is not None and optimal_k in k_values:
        opt_idx = k_values.index(optimal_k)
        opt_score = silhouette_scores[opt_idx]
        ax.scatter([optimal_k], [opt_score], color='#d62728', s=160, zorder=5, label=f'Chosen k = {optimal_k}')
        ax.annotate(
            f'Optimal Separation (k={optimal_k})\nScore = {opt_score:.4f}',
            xy=(optimal_k, opt_score),
            xytext=(optimal_k + 0.5, opt_score * 0.95),
            arrowprops=dict(facecolor='#d62728', shrink=0.08, width=1.5, headwidth=8),
            fontweight='bold',
            color='#d62728',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#e8f5e9', edgecolor='#2ca02c', alpha=0.8)
        )

    ax.set_title("Silhouette Coefficient vs. Number of Clusters (k)", fontsize=14, pad=12, fontweight='bold')
    ax.set_xlabel("Number of Clusters (k)", fontsize=12)
    ax.set_ylabel("Mean Silhouette Coefficient", fontsize=12)
    ax.set_xticks(k_values)
    ax.grid(True, linestyle='--', alpha=0.6)
    ax.legend(frameon=True)
    return save_fig(fig, filename)

def plot_davies_bouldin_index(
    k_values: List[int],
    dbi_scores: List[float],
    optimal_k: Optional[int] = 4,
    filename: str = "03_davies_bouldin_index.png"
) -> Path:
    """
    Plots Davies-Bouldin Index across k (lower is better).
    """
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.plot(k_values, dbi_scores, marker='^', markersize=8, color='#9467bd', linewidth=2.5, label='Davies-Bouldin Index')

    if optimal_k is not None and optimal_k in k_values:
        opt_idx = k_values.index(optimal_k)
        opt_score = dbi_scores[opt_idx]
        ax.scatter([optimal_k], [opt_score], color='#d62728', s=160, zorder=5, label=f'Chosen k = {optimal_k}')
        ax.annotate(
            f'Optimal DBI (k={optimal_k})\nScore = {opt_score:.4f}',
            xy=(optimal_k, opt_score),
            xytext=(optimal_k + 0.5, opt_score * 1.05),
            arrowprops=dict(facecolor='#d62728', shrink=0.08, width=1.5, headwidth=8),
            fontweight='bold',
            color='#d62728',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='#f3e5f5', edgecolor='#9467bd', alpha=0.8)
        )

    ax.set_title("Davies-Bouldin Index vs. Number of Clusters (k) [Lower is Better]", fontsize=14, pad=12, fontweight='bold')
    ax.set_xlabel("Number of Clusters (k)", fontsize=12)
    ax.set_ylabel("Davies-Bouldin Index", fontsize=12)
    ax.set_xticks(k_values)
    ax.grid(True, linestyle='--', alpha=0.6)
    ax.legend(frameon=True)
    return save_fig(fig, filename)

def plot_hierarchical_dendrogram(
    linkage_matrix: np.ndarray,
    p: int = 30,
    filename: str = "04_hierarchical_dendrogram.png"
) -> Path:
    """
    Generates a truncated Agglomerative Hierarchical dendrogram using Ward's linkage.
    """
    fig, ax = plt.subplots(figsize=(10, 6))
    dendrogram(
        linkage_matrix,
        truncate_mode='lastp',
        p=p,
        show_leaf_counts=True,
        leaf_rotation=90,
        leaf_font_size=10,
        color_threshold=linkage_matrix[-3, 2],  # Highlight top 4 clusters
        above_threshold_color='#7f7f7f',
        ax=ax
    )
    ax.set_title(f"Agglomerative Hierarchical Clustering: Ward's Linkage Dendrogram (Truncated p={p})", fontsize=14, pad=12, fontweight='bold')
    ax.set_xlabel("Sample Cluster Subtrees (Leaf Counts)", fontsize=12)
    ax.set_ylabel("Ward Distance Metric (Variance Dissimilarity)", fontsize=12)
    ax.grid(True, linestyle='--', alpha=0.5)
    return save_fig(fig, filename)

def plot_pca_2d_clusters(
    pca_2d: np.ndarray,
    labels: np.ndarray,
    cluster_names: Optional[Dict[int, str]] = None,
    filename: str = "05_pca_2d_clusters.png"
) -> Path:
    """
    Scatter plot of PC1 vs PC2 colored by cluster assignment.
    """
    fig, ax = plt.subplots(figsize=(9, 6.5))
    palette = sns.color_palette("tab10", len(np.unique(labels)))

    unique_labels = sorted(list(np.unique(labels)))
    for label in unique_labels:
        mask = labels == label
        name = cluster_names.get(label, f"Cluster {label}") if cluster_names else f"Cluster {label}"
        ax.scatter(
            pca_2d[mask, 0],
            pca_2d[mask, 1],
            label=name,
            color=palette[label % len(palette)],
            alpha=0.45,
            s=18,
            edgecolors='none'
        )

    ax.set_title("PCA 2D Cluster Space: Principal Component 1 vs. 2", fontsize=14, pad=12, fontweight='bold')
    ax.set_xlabel("Principal Component 1 (PC1)", fontsize=12)
    ax.set_ylabel("Principal Component 2 (PC2)", fontsize=12)
    ax.grid(True, linestyle='--', alpha=0.5)
    ax.legend(title="Route Profiles", bbox_to_anchor=(1.02, 1), loc='upper left', frameon=True)
    return save_fig(fig, filename)

def plot_pca_scree(
    individual_variance: np.ndarray,
    cumulative_variance: np.ndarray,
    max_components: int = 15,
    filename: str = "06_pca_scree_plot.png"
) -> Path:
    """
    Plots the Scree plot showing individual component explained variance bars
    and cumulative explained variance line.
    """
    n_comps = min(len(individual_variance), max_components)
    comp_range = np.arange(1, n_comps + 1)

    fig, ax1 = plt.subplots(figsize=(9, 5.5))
    ax2 = ax1.twinx()

    # Bar chart for individual variance
    ax1.bar(comp_range, individual_variance[:n_comps] * 100, color='#3498db', alpha=0.75, width=0.6, label='Individual Variance (%)')
    # Line chart for cumulative variance
    ax2.plot(comp_range, cumulative_variance[:n_comps] * 100, color='#e74c3c', marker='o', linewidth=2.2, label='Cumulative Variance (%)')

    ax1.set_title("PCA Scree Plot: Explained Variance Ratio Across Principal Components", fontsize=14, pad=12, fontweight='bold')
    ax1.set_xlabel("Principal Component Index", fontsize=12)
    ax1.set_ylabel("Individual Explained Variance (%)", fontsize=12, color='#2980b9')
    ax2.set_ylabel("Cumulative Explained Variance (%)", fontsize=12, color='#c0392b')
    ax1.set_xticks(comp_range)
    ax1.set_ylim(0, max(individual_variance[:n_comps] * 100) * 1.3)
    ax2.set_ylim(0, 105)
    ax1.grid(True, linestyle='--', alpha=0.4)

    # Combine legends
    lines1, labels1 = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines1 + lines2, labels1 + labels2, loc='center right', frameon=True)

    return save_fig(fig, filename)

def plot_cluster_centroids_profile(
    centroids_df: pd.DataFrame,
    filename: str = "07_cluster_centroids_profile.png"
) -> Path:
    """
    Multi-panel bar chart displaying de-standardized real-world numerical feature means
    (Price in INR, Flight Duration in hours, Lead Time in days) per cluster.
    """
    features = ['price', 'duration', 'days_left']
    titles = ['Mean Price (INR ₹)', 'Mean Duration (Hours)', 'Mean Booking Lead Time (Days)']
    colors = ['#2b5c8f', '#e67e22', '#27ae60']

    fig, axes = plt.subplots(1, 3, figsize=(15, 4.5), sharey=False)

    for i, (col, title, color) in enumerate(zip(features, titles, colors)):
        ax = axes[i]
        sns.barplot(
            data=centroids_df,
            x='cluster_name',
            y=col,
            ax=ax,
            palette=[color] * len(centroids_df),
            hue='cluster_name',
            legend=False
        )
        ax.set_title(title, fontsize=12, fontweight='bold', pad=10)
        ax.set_xlabel("")
        ax.set_ylabel("")
        ax.tick_params(axis='x', rotation=25)
        ax.grid(axis='y', linestyle='--', alpha=0.6)

        # Value annotations
        for p in ax.patches:
            val = p.get_height()
            if col == 'price':
                label_text = f"₹{val:,.0f}"
            elif col == 'duration':
                label_text = f"{val:.1f}h"
            else:
                label_text = f"{val:.0f}d"
            ax.annotate(
                label_text,
                (p.get_x() + p.get_width() / 2., val),
                ha='center', va='bottom',
                xytext=(0, 4), textcoords='offset points',
                fontsize=9, fontweight='bold'
            )

    fig.suptitle("De-standardized Real-World Feature Profiles Across Discovered Clusters", fontsize=14, fontweight='bold', y=1.05)
    return save_fig(fig, filename)

