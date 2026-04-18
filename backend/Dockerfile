FROM python:3.12-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir \
    "email-validator>=2.3.0" \
    "fastapi>=0.136.0" \
    "passlib[bcrypt]>=1.7.4" \
    "pydantic>=2.13.2" \
    "sqlalchemy>=2.0.40" \
    "psycopg[binary]>=3.2.0" \
    "uvicorn>=0.44.0"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


