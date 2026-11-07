# Historical Airfare Route Profiles Through Regional Price Behaviour Clustering
## Academic Capstone Project Report | Problem Statement ID: SIH26056
### Course: INT396 - Unsupervised Learning | Units II, III & IV
**Lovely Professional University, Punjab**

---

### Candidate & Academic Credentials
- **Student Name:** Pudi Sai Charan Teja
- **Registration Number:** 12507339
- **Roll Number:** RK3P24XCB35
- **Section:** K3P24XC
- **Course Code:** INT396 (Unsupervised Learning)
- **Course Outcomes Addressed:** CO2 (Partitioning & Density Clustering), CO3 (Hierarchical & Distance Metrics), CO5 (Dimensionality Reduction & Evaluation)
- **Repository:** `airfare-route-clustering`
- **Target Submission Package:** `12507339.zip`

---

## 1. Title Page & Executive Summary

The modern commercial aviation market in India represents one of the fastest-growing domestic transport sectors globally. Characterized by dynamic pricing algorithms, acute yield management practices, and seasonal travel surges, ticket prices fluctuate significantly based on booking lead times, carrier models (Low-Cost Carriers vs. Full-Service Carriers), route congestion, and cabin class.

This project delivers an end-to-end, production-grade unsupervised learning system to identify regional airfare route profiles and uncover underlying pricing behaviors without labeled ground truth. Leveraging the Kaggle Flight Price dataset comprising 300,153 flight records, we build an automated feature transformation pipeline using standard scaling and one-hot categorical encoding. We conduct comprehensive partition clustering using K-Means with $k$-means++ initialization across $k \in [2, 10]$, juxtapose Euclidean ($L_2$) versus Manhattan ($L_1$) distance geometries, validate partition stability against Agglomerative Hierarchical Clustering (Ward’s linkage), and project cluster manifolds into low-dimensional subspaces via Principal Component Analysis (PCA).

The resulting 4-cluster taxonomy establishes actionable commercial archetypes:
1. **Cluster 0:** Standard Mid-Range Economy Corridor (Mean Price: ₹9,053, Duration: 7.9h, Lead Time: 14.3d)
2. **Cluster 1:** Long-Haul Multi-Stop Economy Route (Mean Price: ₹8,654, Duration: 22.4h, Lead Time: 24.7d)
3. **Cluster 2:** Advance Business Class Corridor (Mean Price: ₹55,512, Duration: 14.7h, Lead Time: 25.8d)
4. **Cluster 3:** Budget Advance-Booking Leisure Route (Mean Price: ₹5,865, Duration: 8.2h, Lead Time: 38.1d)

---

## 2. Problem Statement (SIH26056)

### 2.1 Context and Real-World Motivation
Airfare pricing algorithms adjust seat prices continuously across thousands of domestic sectors. Airlines deploy sophisticated revenue management engines that penalize last-minute booking, monetize direct non-stop convenience, and segment leisure from business passengers. However, from the perspective of market regulators, passengers, and corporate booking managers, these high-dimensional price dynamics appear volatile and non-transparent.

### 2.2 Formal Problem Formulation
Given an unlabelled dataset $\mathcal{D} = \{ \mathbf{x}_i \}_{i=1}^N$ of domestic flight transactions characterized by mixed continuous attributes (fare, duration, lead time) and categorical descriptors (airline, source city, destination city, stops, departure time, cabin class), formulate an unsupervised learning framework to:
1. Discover dense, coherent clusters representing regional airfare behaviors.
2. Characterize the mathematical geometry of mixed feature spaces under Euclidean versus Manhattan distance norms.
3. Validate structural stability and hierarchical taxonomy across partition and agglomerative approaches.
4. Reduce high-dimensional variance into orthogonal principal components for visual verification.

---

## 3. Mandatory Objectives

- **Objective 1 (Data Preparation & Scaling):**
  - Ingest, clean, and validate 300,153 flight records from `Clean_Dataset.csv`.
  - Treat index artifacts, verify missing values, and analyze pricing outliers via Interquartile Range (IQR).
  - Implement a modular `ColumnTransformer` applying `StandardScaler` ($z = (x - \mu)/\sigma$) to numerical variables (`duration`, `days_left`, `price`) and `OneHotEncoder(drop='first', sparse_output=False)` to categorical attributes.
  - Serialize transformers using `joblib`.
- **Objective 2 (Clustering, Distance Metrics & PCA Reduction):**
  - Train K-Means across $k \in [2, 10]$ using $k$-means++ seeding ($n\_init=10$, $random\_state=42$).
  - Compare Euclidean ($L_2$) and Manhattan ($L_1$) distances on the mixed continuous-binary manifold.
  - Compute Within-Cluster Sum of Squares (WCSS / Inertia), Silhouette Scores (stratified subsample $N=10,000$), and Davies-Bouldin Index (DBI).
  - Perform Agglomerative Hierarchical Clustering with Ward's linkage, generating a truncated dendrogram and evaluating partition stability via Adjusted Rand Index (ARI).
  - Fit Principal Component Analysis (PCA), compute explained variance ratios, construct a Scree plot, and project samples in 2D/3D spaces.
- **Objective 3 (Interpretation, Profiling & Ethical Limitations):**
  - Inverse-transform cluster centroids into original units (INR, hours, days).
  - Map cluster centroids into commercial archetypes.
  - Inspect PC1 and PC2 feature loadings.
  - Formulate ethical considerations, platform biases, and technical limitations.

---

## 4. Working Architecture & System Flow

```
[Raw Dataset: Clean_Dataset.csv (300,153 records)]
                         │
                         ▼
      [Data Cleaning & IQR Outlier Diagnostics]
                         │
                         ▼
            [ColumnTransformer Pipeline]
  ├── Numerical: StandardScaler (duration, days_left, price)
  └── Categorical: OneHotEncoder (airline, route, stops, class, time)
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
[K-Means Sweeps: k=2..10]   [Agglomerative Ward's Linkage]
  ├── Inertia / WCSS           ├── Linkage Matrix
  ├── Silhouette Score         └── Truncated Dendrogram
  └── Davies-Bouldin Index                  │
          │                                 │
          └──────────────┬──────────────────┘
                         ▼
         [Partition Stability: ARI & NMI]
                         │
                         ▼
      [Dimensionality Reduction: PCA (2D & 3D)]
        ├── Scree Plot & Explained Variance
        └── PC1/PC2 Feature Loading Analysis
                         │
                         ▼
  [Inverse-Transform Centroids & Commercial Archetypes]
                         │
                         ▼
    [Streamlit Interactive Web Application & Visuals]
```

---

## 5. Technology Stack & Environment

- **Core Runtime:** Python 3.13 / 3.11
- **Data Manipulation:** `pandas`, `numpy`
- **Machine Learning & Preprocessing:** `scikit-learn` (`StandardScaler`, `OneHotEncoder`, `KMeans`, `AgglomerativeClustering`, `PCA`)
- **Scientific & Statistical Computing:** `scipy` (`scipy.cluster.hierarchy`, `scipy.spatial.distance`)
- **Model Serialization:** `joblib`
- **Visualization:** `matplotlib`, `seaborn`, `plotly`
- **Interactive UI:** `streamlit`

---

## 6. Detailed Methodology

### 6.1 Feature Scaling and One-Hot Encoding
Continuous features exhibit widely disparate ranges: price spans ₹1,105 to ₹123,071, while duration ranges from 0.8 to 49.8 hours, and booking lead time ranges from 1 to 49 days. Unscaled continuous features would disproportionately dominate distance calculations.
Each continuous feature $x_j$ is standardized:
$$z_{ij} = \frac{x_{ij} - \mu_j}{\sigma_j}$$
Categorical attributes with $C$ distinct categories are transformed into $C-1$ dummy binary variables (`drop='first'`) to prevent multicollinearity. The resulting transformed space comprises 26 orthogonal features.

### 6.2 Distance Metric Evaluation: Euclidean ($L_2$) vs. Manhattan ($L_1$)
For vectors $\mathbf{u}, \mathbf{v} \in \mathbb{R}^D$:
- **Euclidean Distance ($L_2$):**
  $$d_{L_2}(\mathbf{u}, \mathbf{v}) = \sqrt{\sum_{d=1}^D (u_d - v_d)^2}$$
- **Manhattan Distance ($L_1$):**
  $$d_{L_1}(\mathbf{u}, \mathbf{v}) = \sum_{d=1}^D |u_d - v_d|$$

In high-dimensional spaces containing one-hot encoded binary features, $L_2$ distance penalizes differences quadratically, while $L_1$ distance penalizes differences linearly. The empirical comparison shows:
- **Euclidean Silhouette Score:** $0.1512$, mean intra-cluster distance: $2.7377$.
- **Manhattan Silhouette Score:** $0.1555$, mean intra-cluster distance: $7.4175$.
The Manhattan metric slightly outperforms Euclidean distance in measuring separation across sparse categorical coordinates.

### 6.3 Validation Metrics Formulation
1. **Within-Cluster Sum of Squares (WCSS / Inertia):**
   $$\text{WCSS} = \sum_{k=1}^K \sum_{\mathbf{x}_i \in C_k} \|\mathbf{x}_i - \boldsymbol{\mu}_k\|_2^2$$
2. **Silhouette Coefficient:**
   $$s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}, \quad S = \frac{1}{N} \sum_{i=1}^N s(i)$$
3. **Davies-Bouldin Index (DBI):**
   $$R_{ij} = \frac{s_i + s_j}{d(\boldsymbol{\mu}_i, \boldsymbol{\mu}_j)}, \quad \text{DBI} = \frac{1}{K} \sum_{i=1}^K \max_{j \neq i} R_{ij}$$

### 6.4 Principal Component Analysis (PCA)
Given standardized centered matrix $\mathbf{X} \in \mathbb{R}^{N \times 26}$, compute sample covariance matrix:
$$\boldsymbol{\Sigma} = \frac{1}{N-1} \mathbf{X}^T \mathbf{X}$$
Eigendecomposition yields principal directions. The top 3 components explain **54.81%** of total system variance:
- **PC1 (23.71% variance):** Dominant positive loadings on `price` (+0.717) and `duration` (+0.537); dominant negative loading on `class_Economy` (-0.301). This axis represents **Fare and Premium Service Intensity**.
- **PC2 (16.25% variance):** Dominant positive loading on `days_left` (+0.958) and `duration` (+0.267). This axis represents **Advance Booking Lead Time**.
- **PC3 (14.85% variance):** Route sector and carrier allocation variance.

---

## 7. Experimental Results & Visual Analysis

### 7.1 Quantitative Clustering Diagnostics Across Tested $k$

| Number of Clusters ($k$) | WCSS (Inertia) | Silhouette Score | Davies-Bouldin Index | Assessment |
| :---: | :---: | :---: | :---: | :--- |
| $k=2$ | 243,608.19 | 0.2079 | 1.7936 | Binary split (Economy vs Business), masks itinerary nuances |
| $k=3$ | 215,854.88 | 0.1615 | 2.0268 | Transitional partition |
| **$k=4$ (Optimal)** | **196,078.81** | **0.1507** | **1.9156** | **Elbow inflection; optimal balance of cohesion & business interpretability** |
| $k=5$ | 185,559.10 | 0.1404 | 2.0849 | Over-splitting of advance leisure sectors |
| $k=6$ | 178,641.47 | 0.1209 | 2.1575 | Diminishing inertia reduction, higher cluster overlap |
| $k=7$ | 173,190.20 | 0.1169 | 2.2020 | Fragmentation |
| $k=8$ | 168,457.42 | 0.1073 | 2.2245 | Over-partitioned |
| $k=9$ | 164,165.45 | 0.1045 | 2.3144 | Over-partitioned |
| $k=10$ | 161,355.93 | 0.0954 | 2.4409 | Severe fragmentation |

### 7.2 Figure References & Artifacts
The following publication-grade figures (300 DPI) have been generated in `outputs/figures/`:
- **Figure 1:** `01_elbow_wcss_curve.png` — Confirms geometric elbow inflection at $k=4$.
- **Figure 2:** `02_silhouette_scores.png` — Demonstrates silhouette profile across tested $k$.
- **Figure 3:** `03_davies_bouldin_index.png` — Visualizes cluster separation index.
- **Figure 4:** `04_hierarchical_dendrogram.png` — Ward's linkage dendrogram corroborating 4 primary subtrees.
- **Figure 5:** `05_pca_2d_clusters.png` — Clean cluster separation along PC1 (Price/Class) and PC2 (Lead Time).
- **Figure 6:** `06_pca_scree_plot.png` — Scree plot showing individual and cumulative explained variance.
- **Figure 7:** `07_cluster_centroids_profile.png` — De-standardized real-world INR fare, duration, and lead time across clusters.

### 7.3 Hierarchical Stability Cross-Validation
Agglomerative clustering with Ward’s linkage was fitted on a stratified representative sample:
- **Adjusted Rand Index (ARI):** $0.6522$ (Substantial structural concordance with K-Means).
- **Normalized Mutual Information (NMI):** $0.6405$ (High mutual information on cluster membership).

---

## 8. De-Standardized Centroids & Commercial Archetypes

| Cluster ID | Commercial Archetype | Mean Fare (INR) | Mean Flight Duration | Mean Lead Time | Operational Profile |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **0** | **Standard Mid-Range Economy Corridor** | ₹9,053 | 7.95 Hours | 14.34 Days | Moderate lead time economy flights; standard business/personal travel. |
| **1** | **Long-Haul Multi-Stop Economy Route** | ₹8,654 | 22.45 Hours | 24.71 Days | Connecting itineraries with long layovers bridging tier-2 cities. |
| **2** | **Advance Business Class Corridor** | ₹55,512 | 14.67 Hours | 25.76 Days | Premium cabin passengers (Vistara / Air India); high yield corporate accounts. |
| **3** | **Budget Advance-Booking Leisure Route** | ₹5,865 | 8.20 Hours | 38.13 Days | Planned leisure travelers securing early-bird discounted fares. |

---

## 9. Individual Contributions Statement

This project was conducted as an **individual capstone effort (Sr. No. 26)** under student registration number **12507339 (Pudi Sai Charan Teja)**.
- **100% Individual Effort:**
  - Designed mathematical and software architecture.
  - Implemented modular `src/` modules with scikit-learn and scipy.
  - Conducted all metric evaluations (WCSS, Silhouette, DBI, ARI, NMI).
  - Authored the interactive multi-tab Streamlit application.
  - Compiled technical documentation, report, and slide deck.

---

## 10. Limitations, Ethical Considerations & Future Scope

### 10.1 Dataset & Sampling Biases
- **Platform Bias:** Dataset reflects transactions scraped from EaseMyTrip over a fixed window (Feb-Mar 2022); seasonal anomalies (festivals, summer peaks) are not captured.
- **Missing External Factors:** Oil price fluctuations, air traffic control congestion delays, and booking cancellation rates were not present in the source features.

### 10.2 Ethical Considerations
Exploratory clusters are descriptive mathematical patterns, not static deterministic categories. Dynamic pricing engines must avoid predatory pricing on critical medical or emergency routes.

### 10.3 Future Scope
- Integration of real-time streaming APIs (e.g., Amadeus GDS, Skyscanner API).
- Semi-supervised fine-tuning with customer willingness-to-pay (WTP) survey data.
- Implementation of Density-Based Clustering (DBSCAN / HDBSCAN) to identify pricing anomaly outliers.

---

## 11. References
1. MacQueen, J. (1967). *Some methods for classification and analysis of multivariate observations*. Proc. 5th Berkeley Symp. Math. Statist. Prob., 1, 281-297.
2. Arthur, D., & Vassilvitskii, S. (2007). *$k$-means++: The advantages of careful seeding*. SODA '07, 1027-1035.
3. Rousseeuw, P. J. (1987). *Silhouettes: a graphical aid to the interpretation and validation of cluster analysis*. J. Comput. Appl. Math., 20, 53-65.
4. Davies, D. L., & Bouldin, D. W. (1979). *A cluster separation measure*. IEEE TPAMI, 1(2), 224-227.
5. Ward, J. H. (1963). *Hierarchical grouping to optimize an objective function*. J. Amer. Statist. Assoc., 58(301), 236-244.
6. Jolliffe, I. T. (2002). *Principal Component Analysis*. Springer Series in Statistics.
