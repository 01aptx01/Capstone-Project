import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.register_blueprint(routes)

logger.info("🚀 Hardware Agent starting on port 5000...")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)