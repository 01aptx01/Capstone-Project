FROM python:3.10
WORKDIR /app
RUN pip install flask
COPY agent ./agent
CMD ["python", "agent/agent.py"]