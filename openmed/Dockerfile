# OpenMed Dockerfile for Clue Symptom Tracker
#
# Why this exists: Runs the OpenMed biomedical NER service as a REST API.
# OpenMed extracts symptoms, medications, and conditions from user text.
#
# Models preloaded:
# - disease_detection_superclinical: Symptoms and conditions
# - pharma_detection_superclinical: Medications and supplements

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install OpenMed with service dependencies
RUN pip install --no-cache-dir "openmed[hf,service]"

# Create startup script that preloads models
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose FastAPI port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the service
ENTRYPOINT ["/app/entrypoint.sh"]
