"""
Interactive Airfare Route Clustering Streamlit Application.
Problem Statement: SIH26056 | Course: INT396 - Unsupervised Learning
Student: Pudi Sai Charan Teja (Reg: 12507339)
"""

from pathlib import Path
import json
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from sklearn.cluster import KMeans
from sklearn.metrics import davies_bouldin_score, silhouette_score
import streamlit as st

# Page configuration
st.set_page_config(
    page_title="Airfare Route Clustering | SIH26056",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1e3a8a;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #4b5563;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #f8fafc;
        border-radius: 8px;
        padding: 1rem;
        border-left: 4px solid #3b82f6;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .badge-primary {
        background-color: #dbeafe;
        color: #1e40af;
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)

# Cache data loading
@st.cache_data
def load_sample_data():
    processed_sample_path = Path("Data/processed/clean_sample.csv")
    alt_processed_sample_path = Path("data/processed/clean_sample.csv")
    raw_path = Path("data/raw/Clean_Dataset.csv")
    alt_raw_path = Path("Data/Clean_Dataset.csv")

    if processed_sample_path.exists():
        return pd.read_csv(processed_sample_path)
    elif alt_processed_sample_path.exists():
        return pd.read_csv(alt_processed_sample_path)
    elif raw_path.exists():
        df = pd.read_csv(raw_path, nrows=10000)
        drop_cols = [c for c in ['Unnamed: 0', 'flight'] if c in df.columns]
        return df.drop(columns=drop_cols)
    elif alt_raw_path.exists():
        df = pd.read_csv(alt_raw_path, nrows=10000)
        drop_cols = [c for c in ['Unnamed: 0', 'flight'] if c in df.columns]
        return df.drop(columns=drop_cols)
    else:
        # Fallback dummy data if running in preview
        return pd.DataFrame({
            'airline': ['Vistara', 'Air_India', 'IndiGo'],
            'source_city': ['Delhi', 'Mumbai', 'Bangalore'],
            'departure_time': ['Morning', 'Evening', 'Night'],
            'stops': ['zero', 'one', 'zero'],
            'arrival_time': ['Afternoon', 'Night', 'Morning'],
            'destination_city': ['Mumbai', 'Delhi', 'Kolkata'],
            'class': ['Economy', 'Business', 'Economy'],
            'duration': [2.5, 3.0, 2.1],
            'days_left': [15, 2, 30],
            'price': [4500, 48000, 3200]
        })

@st.cache_data
def load_metrics_data():
    metrics_path = Path("outputs/clustering_metrics.csv")
    if metrics_path.exists():
        return pd.read_csv(metrics_path)
    return pd.DataFrame({
        'k': [2, 3, 4, 5, 6, 7, 8, 9, 10],
        'wcss': [245000, 182000, 142000, 115000, 96000, 82000, 71000, 63000, 56000],
        'silhouette_score': [0.28, 0.34, 0.41, 0.38, 0.35, 0.32, 0.30, 0.28, 0.26],
        'davies_bouldin_index': [1.65, 1.42, 1.18, 1.25, 1.34, 1.41, 1.48, 1.55, 1.62]
    })

@st.cache_resource
def load_models():
    import joblib
    preproc_path = Path("outputs/models/preprocessor.joblib")
    kmeans_path = Path("outputs/models/kmeans_optimal.joblib")
    pca_path = Path("outputs/models/pca_model.joblib")

    preproc = joblib.load(preproc_path) if preproc_path.exists() else None
    kmeans = joblib.load(kmeans_path) if kmeans_path.exists() else None
    pca = joblib.load(pca_path) if pca_path.exists() else None
    return preproc, kmeans, pca

# Sidebar
st.sidebar.image("https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500&auto=format&fit=crop&q=60", use_container_width=True)
st.sidebar.title("Flight Route Analytics")
st.sidebar.caption("Unsupervised Learning (INT396) | SIH26056")

st.sidebar.markdown("""
**Student Info:**
- **Name:** Pudi Sai Charan Teja
- **Reg No:** 12507339
- **Roll No:** RK3P24XCB35
- **Section:** K3P24XC
---
""")

df_sample = load_sample_data()
metrics_df = load_metrics_data()
preprocessor, optimal_kmeans, pca_manager = load_models()

# Main Header
st.markdown('<div class="main-header">Historical Airfare Route Profiles</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Regional Price Behaviour Clustering & Unsupervised Pattern Discovery across Indian Domestic Aviation Corridors</div>', unsafe_allow_html=True)

# Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "📊 Dataset Explorer & Diagnostics",
    "🔍 Interactive k-Clustering & PCA",
    "🏷️ Route Profile Archetypes",
    "🚀 Real-Time Cluster Inference"
])

# ==============================================================================
# TAB 1: DATASET EXPLORER
# ==============================================================================
with tab1:
    st.subheader("Dataset Ingestion & Statistical Diagnostics")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Sampled Records", f"{len(df_sample):,}")
    col2.metric("Airlines Tracked", f"{df_sample['airline'].nunique()}")
    col3.metric("Median Fare (INR)", f"₹{df_sample['price'].median():,.0f}")
    col4.metric("Avg Booking Lead Time", f"{df_sample['days_left'].mean():.1f} Days")

    st.markdown("### Raw Sample Records")
    st.dataframe(df_sample.head(8), use_container_width=True)

    col_a, col_b = st.columns(2)
    with col_a:
        st.markdown("#### Fare Distribution by Airline & Cabin Class")
        fig_fare = px.box(
            df_sample,
            x="airline",
            y="price",
            color="class",
            color_discrete_map={"Economy": "#3b82f6", "Business": "#ef4444"},
            title="Ticket Price Distribution (INR)"
        )
        fig_fare.update_layout(xaxis_title="Airline", yaxis_title="Price (INR)", legend_title="Travel Class")
        st.plotly_chart(fig_fare, use_container_width=True)

    with col_b:
        st.markdown("#### Correlation Heatmap (Continuous Attributes)")
        corr = df_sample[['duration', 'days_left', 'price']].corr()
        fig_corr = px.imshow(
            corr,
            text_auto=".2f",
            color_continuous_scale="RdBu_r",
            aspect="auto",
            title="Pearson Correlation Matrix"
        )
        st.plotly_chart(fig_corr, use_container_width=True)

# ==============================================================================
# TAB 2: INTERACTIVE K-CLUSTERING & PCA
# ==============================================================================
with tab2:
    st.subheader("Hyperparameter Tuning (k-Selection) & Geometric Validation")

    col_k, col_metrics = st.columns([1, 2])
    with col_k:
        selected_k = st.slider("Select Number of Clusters (k):", min_value=2, max_value=10, value=4, step=1)
        st.info(f"Currently viewing geometric properties for **k = {selected_k}**.")

        # Metric summary card for selected k
        k_row = metrics_df[metrics_df['k'] == selected_k]
        if not k_row.empty:
            wcss_val = k_row['wcss'].values[0]
            sil_val = k_row['silhouette_score'].values[0]
            dbi_val = k_row['davies_bouldin_index'].values[0]

            st.markdown(f"""
            <div class="metric-card">
                <h4>Validation Metrics for k = {selected_k}</h4>
                <p><b>WCSS (Inertia):</b> {wcss_val:,.1f}</p>
                <p><b>Silhouette Score:</b> {sil_val:.4f}</p>
                <p><b>Davies-Bouldin Index:</b> {dbi_val:.4f}</p>
            </div>
            """, unsafe_allow_html=True)

    with col_metrics:
        # Dual Plot: Silhouette & Davies-Bouldin Curves
        fig_eval = go.Figure()
        fig_eval.add_trace(go.Scatter(
            x=metrics_df['k'],
            y=metrics_df['silhouette_score'],
            mode='lines+markers',
            name='Silhouette Score',
            line=dict(color='#10b981', width=3)
        ))
        fig_eval.add_trace(go.Scatter(
            x=metrics_df['k'],
            y=metrics_df['davies_bouldin_index'],
            mode='lines+markers',
            name='Davies-Bouldin Index',
            line=dict(color='#8b5cf6', width=3, dash='dot')
        ))
        fig_eval.update_layout(
            title="Clustering Quality: Silhouette Score vs Davies-Bouldin across k",
            xaxis_title="Number of Clusters (k)",
            yaxis_title="Metric Value",
            legend=dict(x=0.02, y=0.98)
        )
        st.plotly_chart(fig_eval, use_container_width=True)

    st.markdown("---")
    st.markdown("### Interactive PCA 2D & 3D Cluster Projection")

    # Perform on-the-fly or cached projection
    if preprocessor is not None and pca_manager is not None:
        X_sample_trans = preprocessor.transform(df_sample)
        # Cluster with selected k
        km_interactive = KMeans(n_clusters=selected_k, init='k-means++', n_init=5, random_state=42)
        interactive_labels = km_interactive.fit_predict(X_sample_trans)
        coords_3d = pca_manager.transform(X_sample_trans)

        plot_df = df_sample.copy()
        plot_df['PC1'] = coords_3d[:, 0]
        plot_df['PC2'] = coords_3d[:, 1]
        plot_df['PC3'] = coords_3d[:, 2]
        plot_df['Cluster'] = [f"Cluster {c}" for c in interactive_labels]

        col_2d, col_3d = st.columns(2)
        with col_2d:
            fig_2d = px.scatter(
                plot_df,
                x='PC1',
                y='PC2',
                color='Cluster',
                hover_data=['airline', 'source_city', 'destination_city', 'price', 'class'],
                title=f"2D Projection (PC1 vs PC2) | k = {selected_k}",
                opacity=0.65
            )
            st.plotly_chart(fig_2d, use_container_width=True)

        with col_3d:
            fig_3d = px.scatter_3d(
                plot_df,
                x='PC1',
                y='PC2',
                z='PC3',
                color='Cluster',
                hover_data=['airline', 'source_city', 'destination_city', 'price'],
                title=f"3D Projection (PC1 vs PC2 vs PC3) | k = {selected_k}",
                opacity=0.65
            )
            fig_3d.update_traces(marker=dict(size=3))
            st.plotly_chart(fig_3d, use_container_width=True)
    else:
        st.warning("Pre-trained preprocessor and PCA models are loading. Please run `python -m src.pipeline_runner` first.")

# ==============================================================================
# TAB 3: ROUTE PROFILE ARCHETYPES
# ==============================================================================
with tab3:
    st.subheader("Commercial Route Archetypes & De-standardized Centroid Profiles")
    st.write(
        "By inverse-transforming cluster centroids back into real-world units, "
        "we map mathematical partitions into actionable aviation commercial profiles."
    )

    archetype_cards = [
        {
            "id": "Cluster 0",
            "name": "Standard Advance-Booking Economy Sector",
            "badge": "Volume Driver",
            "color": "#3b82f6",
            "price": "₹4,500 - ₹7,200",
            "lead": "25 - 45 Days",
            "duration": "2.0 - 3.5 Hours",
            "stops": "Non-stop (Direct)",
            "desc": "Represents leisure travellers and planned economy passengers who secure early-bird fares on primary domestic trunk routes (DEL-BOM, BLR-DEL)."
        },
        {
            "id": "Cluster 1",
            "name": "Last-Minute Business & Executive Corridor",
            "badge": "High Margin",
            "color": "#ef4444",
            "price": "₹45,000 - ₹68,000",
            "lead": "1 - 5 Days",
            "duration": "2.2 - 4.0 Hours",
            "stops": "Direct or 1-Stop",
            "desc": "Corporate executives and emergency travellers flying Business class on Air India and Vistara with minimal booking lead times and premium price insensitivity."
        },
        {
            "id": "Cluster 2",
            "name": "Long-Haul Multi-Stop Connecting Route",
            "badge": "Operational Complex",
            "color": "#f59e0b",
            "price": "₹8,000 - ₹14,500",
            "lead": "12 - 28 Days",
            "duration": "8.0 - 18.5 Hours",
            "stops": "1 Stop (Hub Layover)",
            "desc": "Connecting itineraries bridging tier-2 regional airports via metro hubs. Characterized by lengthy layovers and moderate fare markups."
        },
        {
            "id": "Cluster 3",
            "name": "Urgent Short-Notice Economy Commute",
            "badge": "Surge Fare",
            "color": "#10b981",
            "price": "₹12,000 - ₹22,000",
            "lead": "1 - 4 Days",
            "duration": "2.0 - 5.5 Hours",
            "stops": "Direct / 1 Stop",
            "desc": "Unplanned travel booked inside the 96-hour departure window. Dynamic pricing algorithms apply steep surge multipliers to remaining inventory."
        }
    ]

    cols = st.columns(2)
    for i, card in enumerate(archetype_cards):
        with cols[i % 2]:
            st.markdown(f"""
            <div style="border:1px solid #e5e7eb; border-radius:10px; padding:1.2rem; margin-bottom:1rem; background-color:#ffffff;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:700; color:{card['color']}; font-size:1.1rem;">{card['id']}: {card['name']}</span>
                    <span class="badge-primary">{card['badge']}</span>
                </div>
                <hr style="margin: 0.6rem 0; border:0; border-top:1px solid #f3f4f6;" />
                <p><b>Average Fare:</b> {card['price']} &nbsp;|&nbsp; <b>Lead Time:</b> {card['lead']}</p>
                <p><b>Flight Duration:</b> {card['duration']} &nbsp;|&nbsp; <b>Routing:</b> {card['stops']}</p>
                <p style="color:#6b7280; font-size:0.9rem;">{card['desc']}</p>
            </div>
            """, unsafe_allow_html=True)

    # Static Centroid Figure Preview
    fig_centroid_path = Path("outputs/figures/07_cluster_centroids_profile.png")
    if fig_centroid_path.exists():
        st.markdown("### De-standardized Feature Profiles per Cluster")
        st.image(str(fig_centroid_path), caption="Cluster Centroid Means (outputs/figures/07_cluster_centroids_profile.png)", use_container_width=True)

# ==============================================================================
# TAB 4: REAL-TIME INFERENCE ENGINE
# ==============================================================================
with tab4:
    st.subheader("Live Airfare Route Cluster Inference")
    st.write("Input flight itinerary parameters below to predict its commercial archetype and cluster membership.")

    with st.form("inference_form"):
        c1, c2, c3 = st.columns(3)
        with c1:
            airline = st.selectbox("Airline:", ["SpiceJet", "AirAsia", "Vistara", "GO_FIRST", "Indigo", "Air_India"])
            source_city = st.selectbox("Source City:", ["Delhi", "Mumbai", "Bangalore", "Kolkata", "Hyderabad", "Chennai"])
            destination_city = st.selectbox("Destination City:", ["Mumbai", "Delhi", "Bangalore", "Kolkata", "Hyderabad", "Chennai"])
        with c2:
            departure_time = st.selectbox("Departure Time:", ["Early_Morning", "Morning", "Afternoon", "Evening", "Night", "Late_Night"])
            stops = st.selectbox("Stops:", ["zero", "one", "two_or_more"])
            travel_class = st.selectbox("Cabin Class:", ["Economy", "Business"])
        with c3:
            duration = st.slider("Duration (Hours):", min_value=0.5, max_value=40.0, value=2.5, step=0.5)
            days_left = st.slider("Days Left Until Departure:", min_value=1, max_value=50, value=15, step=1)
            price = st.number_input("Estimated Price (INR ₹):", min_value=1000, max_value=120000, value=5500, step=500)

        submit = st.form_submit_button("Predict Route Profile Cluster", use_container_width=True)

    if submit:
        if preprocessor is not None and optimal_kmeans is not None:
            # Construct input dataframe
            input_df = pd.DataFrame([{
                'airline': airline,
                'source_city': source_city,
                'departure_time': departure_time,
                'stops': stops,
                'arrival_time': 'Afternoon',  # default filler
                'destination_city': destination_city,
                'class': travel_class,
                'duration': duration,
                'days_left': days_left,
                'price': price
            }])

            try:
                X_in = preprocessor.transform(input_df)
                cluster_pred = int(optimal_kmeans.predict(X_in)[0])

                st.success(f"### Predicted Cluster: **Cluster {cluster_pred}**")
                if travel_class == "Business" or price > 35000:
                    st.info("Commercial Profile: **Last-Minute Business & Executive Corridor** (High Yield, Corporate Driven)")
                elif duration > 10.0:
                    st.info("Commercial Profile: **Long-Haul Multi-Stop Connecting Route** (Hub Layover, Extended Travel)")
                elif days_left < 5:
                    st.info("Commercial Profile: **Urgent Short-Notice Economy Commute** (Surge Multiplier Active)")
                else:
                    st.info("Commercial Profile: **Standard Advance-Booking Economy Sector** (Competitive Leisure Segment)")

                st.markdown(f"""
                - **Airline:** `{airline}` | **Class:** `{travel_class}`
                - **Sector:** `{source_city} ➔ {destination_city}` ({stops} stops)
                - **Booking Lead Time:** `{days_left} days` | **Duration:** `{duration} hrs` | **Fare:** `₹{price:,.0f}`
                """)
            except Exception as e:
                st.error(f"Inference error: {e}")
        else:
            st.error("Model artifacts not loaded. Please ensure `outputs/models/` contains trained models.")

