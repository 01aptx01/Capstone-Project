FROM python:3.10
WORKDIR /app
RUN pip install flask
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "agent.py"]