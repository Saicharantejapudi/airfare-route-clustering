# Multi-stage Dockerfile optimized for Hugging Face Spaces (Docker SDK)
# Free 16GB RAM + 2 vCPU environment

# ==============================================================================
# Stage 1: Build React Multi-Page Frontend with Node.js
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Python Backend Runtime with Non-Root User for Hugging Face
# ==============================================================================
FROM python:3.11-slim

# Create standard non-root user (UID 1000) required by Hugging Face Spaces
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860

WORKDIR $HOME/app

# Install Python requirements
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy backend application, ML modules, trained models, and sample data
COPY --chown=user:user api/ ./api/
COPY --chown=user:user src/ ./src/
COPY --chown=user:user outputs/ ./outputs/
COPY --chown=user:user data/processed/ ./data/processed/

# Copy built frontend assets from Stage 1 into frontend/dist
COPY --chown=user:user --from=frontend-builder /app/frontend/dist ./frontend/dist

# Hugging Face Spaces standard port is 7860
EXPOSE 7860

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]
