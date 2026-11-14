# Historical Airfare Route Profiles Through Regional Price Behaviour Clustering
## Academic Capstone Presentation | Problem Statement ID: SIH26056
### INT396 — Unsupervised Learning (Units II, III & IV)
**Lovely Professional University, Punjab**

---

## Slide 1: Title Slide & Project Metadata
- **Project Title:** Historical Airfare Route Profiles Through Regional Price Behaviour Clustering (**AeroCluster**)
- **Problem Statement ID:** SIH26056 (Individual Capstone Project)
- **Candidate Name:** Pudi Sai Charan Teja
- **Registration Number:** `12507339` | **Roll No:** `RK3P24XCB35` | **Section:** `K3P24XC`
- **Course Outcomes:** `CO2`, `CO3`, `CO5`
- **GitHub Repository:** [https://github.com/Saicharantejapudi/airfare-route-clustering](https://github.com/Saicharantejapudi/airfare-route-clustering)
- **Live Cloud Portal (Render):** [https://aerocluster.onrender.com](https://aerocluster.onrender.com)

---

## Slide 2: Introduction & Problem Statement
- **Aviation Context:** Indian domestic airfares swing dramatically across identical routes due to algorithmic dynamic pricing.
- **Hidden Pricing Traps:**
  - *96-Hour Surge Trap:* Last-minute fares escalate up to +120% inside 4 days to departure.
  - *Layover Discount Illusion:* Low fares often mask 18–24h connecting layovers rather than real deals.
- **Unsupervised Challenge:** Given **300,153 unlabeled flight records**, uncover natural route pricing profiles without ground-truth class labels.

---

## Slide 3: Project Objectives & Need
- **Objective 1 (Data Preparation — Unit I/II):** Ingest & clean 300,153 records (`Clean_Dataset.csv`); detect extreme outliers via IQR; build `ColumnTransformer` (`StandardScaler` + `OneHotEncoder`).
- **Objective 2 (Clustering, Metrics & PCA — CO2, CO3, CO5):**
  - Sweep K-Means ($k = 2 \dots 10$), justify $k^* = 4$ via WCSS, Silhouette, and Davies-Bouldin Index.
  - Compare $L_2$ Euclidean vs. $L_1$ Manhattan distances and cross-validate with Ward's Hierarchical Linkage.
  - Apply DBSCAN ($\epsilon = 1.65, \text{MinPts} = 15$) to isolate surge gouging & flash-sale outliers.
  - Project onto 2D/3D Principal Component spaces (PCA).
- **Objective 3 (Real-World Delivery):** De-standardize centroids into passenger-ready benchmarks & deploy an interactive full-stack web platform.

---

## Slide 4: Project Overview, Key Features & Architecture
- **Dual-Mode Production Web Application (AeroCluster):**
  - **Passenger Mode:** Instant Deal Verdict + Value Score (`/10`), Advance Booking Surge Trajectory Curve, Downloadable/Printable Valuation Certificate Modal (iframe print engine).
  - **Analyst Lab Mode:** Interactive 3D PCA Sphere (1,000 samples + centroid gravity markers), Elbow/Silhouette/DBI Diagnostics, DBSCAN Anomaly Card, Interactive SVG Route Corridor Network Map (6 metro hubs, 12 corridors), Live Predictor with 1-click presets.
- **REST API Architecture (FastAPI):** `/health`, `/dataset/summary`, `/metrics/k-sweep`, `/metrics/dbscan-anomalies`, `/clusters/centroids`, `/pca/projections`, `/predict/route-cluster`.

---

## Slide 5: Tools, Technologies & Frameworks
- **Machine Learning Core:** Python 3.13, `scikit-learn`, `scipy`, `numpy`, `pandas`, `joblib`
- **Backend API & Validation:** FastAPI, Uvicorn, Pydantic v2 (`CORS` + typed schemas)
- **Frontend UI & Visualizations:** React 19, Tailwind CSS v4, Vite, Plotly.js (3D WebGL), Recharts, Custom SVG, Lucide Icons
- **Static Academic Plotting:** Matplotlib & Seaborn (7 figures @ 300 DPI)
- **Testing & Deployment:** `pytest` (7 integration tests), Docker Multi-Stage Build, Render Cloud, GitHub

---

## Slide 6: Methodology — Preprocessing & Mixed-Space Geometry
- **Dataset:** Kaggle *Flight Price Prediction* (`300,153` rows, `10` raw columns, 6 carriers, 6 metro hubs).
- **Feature Engineering (`26` dimensions):**
  - Continuous (`price`, `duration`, `days_left`) standardized via $z = (x - \mu)/\sigma$.
  - Categorical (`airline`, `source_city`, `destination_city`, `stops`, `class`, `departure_time`) one-hot encoded (`drop='first'`).
- **Euclidean ($L_2$) vs. Manhattan ($L_1$) Sensitivity:**
  - Euclidean Silhouette: **0.1512** (Mean intra-cluster dist: `2.7377`)
  - Manhattan Silhouette: **0.1555** (Mean intra-cluster dist: `7.4175`) — linear taxicab norm avoids squaring outlier noise across sparse binary dimensions.

---

## Slide 7: Model Comparison — K-Means ($k=2..10$) & Ward Linkage

| $k$ | WCSS (Inertia) | Silhouette | Davies-Bouldin | Assessment |
| :---: | :---: | :---: | :---: | :--- |
| $k=2$ | 243,608.19 | 0.2079 | 1.7936 | Coarse binary split (Economy vs. Business) |
| $k=3$ | 215,854.88 | 0.1615 | 2.0268 | Transitional partition |
| **$k=4$** | **196,078.81** | **0.1507** | **1.9156** | **Optimal Elbow inflection & distinct archetypes** |
| $k=5$ | 185,559.10 | 0.1404 | 2.0849 | Over-splits leisure segments |
| $k=6..10$ | 178k to 161k | 0.12 to 0.09 | 2.15 to 2.44 | Diminishing gains & fragmentation |

- **Ward's Hierarchical Cross-Validation:** **ARI = `0.6522`** | **NMI = `0.6405`** (strong structural alignment).

---

## Slide 8: DBSCAN Anomaly Detection vs. Forced Partitioning
- **Limitation of K-Means Alone:** Forces every point (including ₹1,14,705 extreme gouging spikes) into one of $k$ Voronoi cells.
- **DBSCAN Density Reachability ($\epsilon = 1.65, \text{MinPts} = 15$):**
  - **Isolated Noise (`label = -1`):** `190 / 5,000` flights (**3.80%**) separated from core clusters.
  - **Extreme Surge / Price Gouging:** **59 outliers** ($\ge ₹35,000$, up to $₹1,14,705$).
  - **Flash Sales / Glitches:** **4 outliers** ($\le ₹3,000$, down to $₹1,105$).
  - **Mean Noise Fare:** **₹29,103.77** vs. **₹20,551.01** Core Mean (**+41.6%** elevation).

---

## Slide 9: Dimensionality Reduction (PCA) & Visual Diagnostics
- **3-Component Cumulative Variance:** **54.81%** across 26 orthogonal dimensions:
  - **PC1 (23.71%):** *Fare & Service Intensity* (`price` +0.717, `duration` +0.537, `class_Economy` -0.301).
  - **PC2 (16.25%):** *Advance Booking Lead Time* (`days_left` +0.958, `duration` +0.267).
  - **PC3 (14.85%):** *Route Sector & Airline Variance*.
- Embedded Figures (`outputs/figures/`): Elbow Curve, Silhouette Curve, Davies-Bouldin, Ward Dendrogram, 2D PCA Scatter, PCA Scree Plot, Centroids Profile.

---

## Slide 10: Discovered Commercial Route Archetypes ($k=4$)
- **Cluster 0 — Standard Mid-Range Economy Corridor:** ₹9,053 | 7.95 hrs | 14.3 days *(Volume trunk economy)*
- **Cluster 1 — Long-Haul Multi-Stop Economy Route:** ₹8,654 | 22.45 hrs | 24.7 days *(Connecting layover compromise)*
- **Cluster 2 — Advance Business Class Corridor:** ₹55,512 | 14.67 hrs | 25.8 days *(Inelastic corporate accounts)*
- **Cluster 3 — Budget Advance-Booking Leisure Route:** ₹5,865 | 8.20 hrs | 38.1 days *(Early-bird 30–45d sweet spot)*

---

## Slide 11: Live System Results, Testing & Web Screenshots
- **Automated `pytest` Suite:** **7 / 7 passed** (`data_cleaning_and_iqr`, `route_preprocessor`, `kmeans_sweep`, `distance_comparison`, `hierarchical_stability`, `pca_decomposition`, `dbscan_anomaly_detection`).
- **Live Cloud Verification (`aerocluster.onrender.com`):** Multi-stage Docker deployment active (HTTP 200 `/health` & `/dbscan-anomalies`).
- **Live Screenshots Captured:**
  - Consumer Verdict + Surge Trajectory Curve (`01_home_verdict_surge.png`)
  - Printable Valuation Certificate Modal (`02_assessment_certificate_modal.png`)
  - Diagnostics & DBSCAN Console (`03_diagnostics_elbow.png`, `03b_diagnostics_dbscan.png`)
  - Route Corridor Network Map (`04_explorer_network_map.png`)
  - 3D WebGL PCA Scatter & Predictor (`05_pca_3d_space.png`, `06_predict_presets.png`)

---

## Slide 12: Individual Contributions (100% Individual Effort)
- **Candidate:** Pudi Sai Charan Teja (`12507339`)
- **Complete End-to-End Ownership:**
  1. Data engineering pipeline, `ColumnTransformer`, and 300,153-row processing (`src/`).
  2. Multi-algorithm benchmarking: K-Means, $L_1$/$L_2$ geometry, Ward linkage, DBSCAN, and 3D PCA (`src/`).
  3. Production FastAPI service, Pydantic schemas, and centroid proximity inference (`api/`).
  4. Full React 19 UI (Consumer Checker, Surge SVG Curve, Certificate Print Engine, Route Network Map, 3D PCA Sphere).
  5. Unit/integration `pytest` suite, Docker containerization, Render Cloud deployment, Report PDF & Slide Deck.

---

## Slide 13: Practical Applications, Limitations, Ethics & Future Scope
- **Practical Impact:** Protects consumers from 96h surge pricing; enables regulatory auditing of price gouging; guides enterprise travel booking policies.
- **Limitations:** Source data covers Feb–Mar 2022 EaseMyTrip snapshot (lacks seasonal festival spikes, fuel cost, and load factors).
- **Ethical Scope:** Clusters reflect descriptive mathematical patterns—dynamic pricing systems must enforce transparency guardrails on critical routes.
- **Future Scope:** Real-time GDS flight streaming, HDBSCAN variable-density tuning on regional UDAN routes, festival-season regressors.

---

## Slide 14: References & Resources
1. MacQueen, J. (1967) — *K-Means*, 5th Berkeley Symp. Math. Statist. Prob.
2. Arthur, D., & Vassilvitskii, S. (2007) — *k-means++*, SODA '07.
3. Rousseeuw, P. J. (1987) — *Silhouettes*, J. Comput. Appl. Math.
4. Davies, D. L., & Bouldin, D. W. (1979) — *Cluster Separation Measure*, IEEE TPAMI.
5. Ward, J. H. (1963) — *Hierarchical Grouping*, JASA.
6. Ester, M. et al. (1996) — *DBSCAN*, KDD-96.
7. Kaggle Dataset: [Flight Price Prediction (`Clean_Dataset.csv`)](https://www.kaggle.com/datasets/shubhambathwal/flight-price-prediction).
