FROM python:3.8.18-alpine

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED=1

WORKDIR /usr/src/patrik_mimic
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . /usr/src/patrik_mimic

EXPOSE 8001
CMD ["python", "mimic_server.py"]