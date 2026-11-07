# Historical Airfare Route Profiles Through Regional Price Behaviour Clustering
## Academic Capstone Presentation Slides | Problem Statement SIH26056
### INT396 - Unsupervised Learning | Units II, III & IV
**Lovely Professional University, Punjab**

---

## Slide 1: Title Slide & Project Identification
- **Project Title:** Historical Airfare Route Profiles Through Regional Price Behaviour Clustering
- **Problem Statement ID:** SIH26056
- **Project Type:** Individual Project (Sr. No. 26)
- **Student Name:** Pudi Sai Charan Teja
- **Registration Number:** 12507339
- **Roll Number:** RK3P24XCB35
- **Section:** K3P24XC
- **Course Outcomes:** CO2, CO3, CO5
- **GitHub Repository:** [charanteja-pudi/airfare-route-clustering](https://github.com/charanteja-pudi/airfare-route-clustering)
- **Live Streamlit App:** [airfare-route-clustering.streamlit.app](https://airfare-route-clustering.streamlit.app/)

---

## Slide 2: Problem Statement & Motivation
- **Aviation Context:** Indian domestic aviation is experiencing unprecedented passenger volume growth paired with aggressive yield management.
- **The Challenge:** Ticket prices fluctuate dynamically based on booking lead times, carrier tier, and route density.
- **Unsupervised Learning Objective:** Group flight routes and booking transactions into dense, interpretable behavioral clusters without ground-truth labels.
- **Key Questions Answered:**
  - What are the natural pricing clusters across domestic sectors?
  - How do Euclidean and Manhattan distance metrics behave on mixed continuous-categorical spaces?
  - How do partition and hierarchical taxonomies align?

---

## Slide 3: University-Mandated Objectives
- **Objective 1 (Data Preparation & Scaling):**
  - Ingest 300,153 records (`Clean_Dataset.csv`).
  - Modular scikit-learn `ColumnTransformer`: `StandardScaler` for continuous features (`duration`, `days_left`, `price`); `OneHotEncoder(drop='first')` for categoricals (`airline`, cities, `stops`, `class`, `departure_time`).
- **Objective 2 (Clustering, Distance Metrics & PCA):**
  - Train K-Means across $k \in [2, 10]$ with $k$-means++ seeding.
  - Compare Euclidean ($L_2$) vs Manhattan ($L_1$) distance geometries.
  - Validate partitions via WCSS, Silhouette Score, and Davies-Bouldin Index.
  - Cross-validate with Agglomerative Hierarchical Clustering (Ward's linkage).
  - Perform PCA dimensionality reduction, Scree analysis, and 2D/3D projections.
- **Objective 3 (Commercial Profiling & Limitations):**
  - De-standardize cluster centroids into real-world units (INR, hours, days).
  - Characterize commercial route archetypes.
  - Document dataset biases and ethical deployment guidelines.

---

## Slide 4: System Architecture & Workflow Pipeline
- **Raw Data Ingestion:** 300,153 flights scraped from EaseMyTrip.
- **Feature Pipeline:** `ColumnTransformer` with `StandardScaler` and `OneHotEncoder(drop='first')` producing 26 features.
- **Partition Engine:** Multi-k sweep ($k=2 \dots 10$) with `k-means++` initialization ($n\_init=10$).
- **Validation Suite:** WCSS / Inertia, Silhouette Score, Davies-Bouldin Index.
- **Hierarchical Engine:** Ward's minimum variance agglomeration with dendrogram pruning.
- **Dimensionality Reduction:** 2D and 3D PCA coordinate mapping (54.81% cumulative variance across 3 PCs).
- **Web Interface:** Interactive Streamlit dashboard with real-time inference tool.

---

## Slide 5: Technology Stack
- **Languages & Frameworks:** Python 3.13, Streamlit
- **Machine Learning Core:** scikit-learn (`StandardScaler`, `OneHotEncoder`, `KMeans`, `AgglomerativeClustering`, `PCA`)
- **Scientific Libraries:** NumPy, SciPy (hierarchical linkage & distance matrices), Pandas
- **Visualization:** Matplotlib, Seaborn, Plotly Express & Graph Objects
- **Model Storage:** Joblib serialization

---

## Slide 6: Distance Metric Sensitivity: Euclidean ($L_2$) vs. Manhattan ($L_1$)
- **Euclidean ($L_2$) Distance:**
  $$d_{L_2}(\mathbf{x}, \mathbf{y}) = \sqrt{\sum_i (x_i - y_i)^2}$$
  - Squares feature discrepancies; dominated by large continuous variances.
  - Empirical Silhouette: **0.1512** | Mean intra-cluster distance: **2.7377**
- **Manhattan ($L_1$ / Taxicab) Distance:**
  $$d_{L_1}(\mathbf{x}, \mathbf{y}) = \sum_i |x_i - y_i|$$
  - Measures rectilinear displacement along orthogonal one-hot binary dimensions.
  - Empirical Silhouette: **0.1555** | Mean intra-cluster distance: **7.4175**
- **Conclusion:** Manhattan distance yields slightly crisper cluster boundaries on sparse categorical representations.

---

## Slide 7: Experimental Results & Model Validation

| Number of Clusters ($k$) | WCSS (Inertia) | Silhouette Score | Davies-Bouldin Index | Assessment |
| :---: | :---: | :---: | :---: | :--- |
| $k=2$ | 243,608.19 | 0.2079 | 1.7936 | Binary split (Economy vs Business) |
| $k=3$ | 215,854.88 | 0.1615 | 2.0268 | Transitional partition |
| **$k=4$ (Optimal)** | **196,078.81** | **0.1507** | **1.9156** | **Elbow inflection & distinct commercial archetypes** |
| $k=5$ | 185,559.10 | 0.1404 | 2.0849 | Over-splitting of advance leisure sectors |
| $k=6$ | 178,641.47 | 0.1209 | 2.1575 | Diminishing returns |

- **Hierarchical Cross-Validation:**
  - Adjusted Rand Index (ARI): **0.6522**
  - Normalized Mutual Information (NMI): **0.6405**
  - Corroborates strong structural alignment between K-Means and Ward's agglomeration.

---

## Slide 8: Visual Artifacts & Diagnostic Plots
*(All figures saved at 300 DPI in `outputs/figures/`)*
1. **Elbow WCSS Curve:** Distinct geometric inflection at $k=4$.
2. **Silhouette Plot:** Evaluates separation profile across $k=2..10$.
3. **Davies-Bouldin Index:** Inflection at $k=4$ ($\text{DBI} = 1.9156$).
4. **Hierarchical Dendrogram:** Ward's linkage pruning confirms 4 primary subtrees.
5. **PCA 2D Cluster Space:** Clear separation across PC1 (Price/Class) and PC2 (Lead Time).
6. **PCA Scree Plot:** Cumulative variance trajectory across 20 components.
7. **Centroid Profile Bar Chart:** De-standardized real-world INR fare, duration, and lead time.

---

## Slide 9: Discovered Route Archetypes

- **Cluster 0: Standard Mid-Range Economy Corridor**
  - *Fare:* ₹9,053 | *Lead Time:* 14.3 Days | *Duration:* 7.95 Hours
  - Standard economy travelers booking 2 weeks in advance.
- **Cluster 1: Long-Haul Multi-Stop Economy Route**
  - *Fare:* ₹8,654 | *Lead Time:* 24.7 Days | *Duration:* 22.45 Hours
  - Extended multi-stop connecting itineraries bridging regional hubs.
- **Cluster 2: Advance Business Class Corridor**
  - *Fare:* ₹55,512 | *Lead Time:* 25.8 Days | *Duration:* 14.67 Hours
  - Premium full-service passengers (Air India / Vistara Business).
- **Cluster 3: Budget Advance-Booking Leisure Route**
  - *Fare:* ₹5,865 | *Lead Time:* 38.1 Days | *Duration:* 8.20 Hours
  - Price-sensitive leisure passengers securing early-bird promotional fares.

---

## Slide 10: Streamlit Dashboard Demo & Architecture
- **Tab 1: Dataset Explorer:** Interactive filtering, boxplots, and Pearson correlation heatmap.
- **Tab 2: Interactive Clustering & PCA:** Real-time $k$-slider, 2D/3D Plotly visualizers, and metric scorecards.
- **Tab 3: Route Profile Archetypes:** De-standardized centroid radar/bar comparisons.
- **Tab 4: Real-Time Cluster Inference:** Live interactive prediction tool for arbitrary itinerary parameters.

---

## Slide 11: Individual Contributions & Academic Ownership
- **Project Structure:** 100% Individual Effort (Sr. No. 26).
- **Student:** Pudi Sai Charan Teja (Reg No: 12507339).
- **End-to-End Ownership:**
  - Complete data pipeline engineering and scikit-learn transformers.
  - Multi-k clustering execution, distance metric benchmarking, and hierarchical validation.
  - PCA loadings and mathematical formulation.
  - Streamlit dashboard design, deployment readiness, and technical report writing.

---

## Slide 12: Limitations, Ethical Scope & Conclusion
- **Limitations:**
  - Scraping window limited to Feb-Mar 2022; seasonal festival peaks not captured.
  - Unobserved factors (fuel costs, weather delays, cancellation rates).
- **Ethical Considerations:**
  - Clusters represent descriptive mathematical patterns, not static market boundaries.
  - Dynamic pricing engines must maintain transparent guardrails on emergency routes.
- **Conclusion:**
  - Successfully achieved all course outcomes (CO2, CO3, CO5) for INT396 with a production-grade, reproducible unsupervised learning system.
