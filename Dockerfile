FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY templates/ templates/
COPY static/ static/

EXPOSE 1337

CMD ["gunicorn", "-b", "0.0.0.0:1337", "-w", "2", "--threads", "4", "app:app"]
