import os
import logging
import time
import mysql.connector
from mysql.connector import Error
from mysql.connector import pooling

# Configure logger
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self, pool_name="app_pool", pool_size=5, max_retries=30, retry_delay=1):
        """Initialize Database Manager และสร้าง Connection Pool เตรียมไว้"""
        self.db_config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_NAME", "vending"),
            "charset": "utf8mb4",
            "collation": "utf8mb4_unicode_ci",
            "autocommit": False,  # ให้ app control transaction
            "connection_timeout": 10
        }
        
        self.pool = None
        self.pool_name = pool_name
        self.pool_size = pool_size
        self._init_pool_with_retry(max_retries, retry_delay)

    def _init_pool_with_retry(self, max_retries: int, retry_delay: int):
        """สร้าง Connection Pool พร้อม retry logic"""
        for attempt in range(1, max_retries + 1):
            try:
                self.pool = mysql.connector.pooling.MySQLConnectionPool(
                    pool_name=self.pool_name,
                    pool_size=self.pool_size,
                    pool_reset_session=True,
                    **self.db_config
                )
                logger.info(f"✅ [DatabaseManager] Connection pool '{self.pool_name}' (size: {self.pool_size}) created successfully on attempt {attempt}.")
                return  # สำเร็จแล้ว
                
            except Error as e:
                if attempt < max_retries:
                    logger.warning(f"⚠️ [DatabaseManager] Failed to create pool (attempt {attempt}/{max_retries}): {e}")
                    logger.info(f"⏳ [DatabaseManager] Retrying in {retry_delay} second(s)...")
                    time.sleep(retry_delay)
                else:
                    logger.error(f"❌ [DatabaseManager] FATAL: Failed to create connection pool after {max_retries} attempts: {e}")
                    logger.error(f"❌ [DatabaseManager] Database Config: host={self.db_config['host']}, user={self.db_config['user']}, database={self.db_config['database']}")
                    raise e

    def get_connection(self):
        """ดึง Connection จาก Pool ออกมาใช้งาน"""
        if not self.pool:
            logger.error("❌ [DatabaseManager] Pool is not initialized.")
            raise RuntimeError("Database pool not initialized")
            
        try:
            conn = self.pool.get_connection()
            # ตรวจสอบว่า connection ยังมีชีวิตหรือไม่
            conn.ping(reconnect=True)
            return conn
        except Error as e:
            logger.error(f"❌ [DatabaseManager] Failed to get connection from pool: {e}")
            raise e

db_manager = None

def init_db():
    """เรียกใช้เมื่อ app startup (ใน main.py)"""
    global db_manager
    
    pool_name = os.getenv("DB_POOL_NAME", "app_pool")
    pool_size = int(os.getenv("DB_POOL_SIZE", "5"))
    max_retries = int(os.getenv("DB_MAX_RETRIES", "30"))
    retry_delay = int(os.getenv("DB_RETRY_DELAY", "1"))
    
    db_manager = DatabaseManager(
        pool_name=pool_name,
        pool_size=pool_size,
        max_retries=max_retries,
        retry_delay=retry_delay
    )

def get_db():
    """ดึง connection จาก pool"""
    if db_manager is None:
        raise RuntimeError("Database not initialized. Call init_db() first")
    return db_manager.get_connection()