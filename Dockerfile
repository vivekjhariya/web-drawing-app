# ---------------- FRONTEND BUILD ----------------
FROM node:18-alpine AS frontend
WORKDIR /app
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./
RUN npm install --silent
COPY frontend/ .
RUN npm run build && rm -rf node_modules

# ---------------- PYTHON DEPS ----------------  
FROM python:3.11-slim AS python-deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt --target /deps && \
    find /deps -name "*.pyc" -delete && \
    find /deps -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true

# ---------------- FINAL STAGE ----------------
FROM gcr.io/distroless/python3-debian12:nonroot
WORKDIR /app
COPY --from=python-deps /deps /usr/local/lib/python3.11/site-packages
COPY backend/app ./app
COPY --from=frontend /app/dist ./static
ENV PYTHONPATH=/usr/local/lib/python3.11/site-packages:/app
EXPOSE 8000
CMD ["app/main.py"]
