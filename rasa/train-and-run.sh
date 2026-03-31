#!/bin/bash
# Rasa Train and Run Script
#
# Why this exists: Trains the Rasa model at container startup instead of
# build time. This keeps docker build fast and makes training logs visible.
# On subsequent restarts, if a model already exists it reuses it.

set -e

# Rasa is installed in a virtualenv in the base image
export PATH="/opt/venv/bin:$PATH"

MODEL_DIR="/app/models"
MODEL_FILE="${MODEL_DIR}/clue-model.tar.gz"

# Train only if no model exists yet
if [ ! -f "$MODEL_FILE" ]; then
  echo "No model found. Training now..."
  rasa train --fixed-model-name clue-model
  echo "Training complete."
else
  echo "Model already exists. Skipping training."
fi

# Start the Rasa server
exec rasa run \
  --enable-api \
  --cors "*" \
  --debug \
  --endpoints /app/endpoints.yml
