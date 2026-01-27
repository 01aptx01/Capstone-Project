from flask import Flask, request, send_from_directory
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

@app.route("/")
def react_app():
    return send_from_directory("../web/web-ui/build", "index.html")


@app.route("/static/<path:path>")
def static_files(path):
    return send_from_directory("../web/web-ui/build/static", path)

app.run(host="0.0.0.0", port=8000)