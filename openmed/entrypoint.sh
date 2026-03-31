#!/bin/bash
# OpenMed Entrypoint Script
#
# Why this exists: Starts the OpenMed REST service with uvicorn.
# Models are preloaded at startup for faster first requests.

set -e

echo "Starting OpenMed service..."
echo "Preloading models (this may take a few minutes on first run)..."

# Preload the models we need
export OPENMED_SERVICE_PRELOAD_MODELS="disease_detection_superclinical,pharma_detection_superclinical"

# Start the FastAPI service
exec uvicorn openmed.service.app:app \
    --host 0.0.0.0 \
    --port 8080 \
    --workers 1
