FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    curl \
    zstd

RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

EXPOSE 8080
EXPOSE 11434

CMD gunicorn app:app --bind 0.0.0.0:8080
