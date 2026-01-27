from flask import Flask, request
from flasgger import Swagger
from app.config.db import get_db
from app.api.buy import buy_api
import mysql.connector
import os

app = Flask(__name__)
swagger = Swagger(app, template_file='swagger.yaml')
app.register_blueprint(buy_api)

@app.route("/health")
def health():
    return {"status": "server-ok"}

app.run(host="0.0.0.0", port=8000)