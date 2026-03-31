# Rasa Dockerfile for Clue Symptom Tracker
#
# Why this exists: Builds a Rasa image with our custom domain, NLU, and stories.
# Model training happens at container startup (not build time) so:
# - Docker build is fast (<2s)
# - Training logs are visible in `docker-compose logs -f rasa`
# - Retrain by removing the rasa_models volume and restarting
#
# Uses base (non-full) image for ARM64 compatibility on Apple Silicon.
# The -full image uses AVX2 instructions that crash under ARM64 emulation.

FROM rasa/rasa:3.6.20

WORKDIR /app

COPY config.yml .
COPY domain.yml .
COPY credentials.yml .
COPY endpoints.yml .
COPY data/ ./data/
COPY train-and-run.sh .

EXPOSE 5005

ENTRYPOINT ["bash", "/app/train-and-run.sh"]
