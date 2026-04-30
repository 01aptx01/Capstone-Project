import os
import logging
import mysql.connector
from mysql.connector import Error
from mysql.connector import pooling

# Configure logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

class DatabaseManager:
    def __init__(self, pool_name="app_pool", pool_size=5):
        """
        Initialize Database Manager และสร้าง Connection Pool เตรียมไว้
        """
        self.db_config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_NAME", "vending_db"),
            "charset": "utf8mb4",
            "collation": "utf8mb4_unicode_ci"
        }
        
        self.pool = None
        self._init_pool(pool_name, pool_size)

    def _init_pool(self, pool_name: str, pool_size: int):
        """สร้าง Connection Pool เพื่อให้แอปพลิเคชันดึงไปใช้ซ้ำได้"""
        try:
            self.pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name=pool_name,
                pool_size=pool_size,
                pool_reset_session=True,
                **self.db_config
            )
            logger.info(f"✅ [DatabaseManager] Connection pool '{pool_name}' (size: {pool_size}) created.")
        except Error as e:
            logger.error(f"❌ [DatabaseManager] FATAL: Failed to create connection pool: {e}")
            raise e

    def get_connection(self):
        """ดึง Connection จาก Pool ออกมาใช้งาน"""
        if not self.pool:
            logger.error("❌ [DatabaseManager] Pool is not initialized.")
            return None
        try:
            return self.pool.get_connection()
        except Error as e:
            logger.error(f"❌ [DatabaseManager] Failed to get connection from pool: {e}")
            raise e

db_manager = DatabaseManager(pool_name="vending_app_pool", pool_size=5)

def get_db():
    return db_manager.get_connection()