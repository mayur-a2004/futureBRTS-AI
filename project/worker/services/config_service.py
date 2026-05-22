import os
import pymongo
from typing import Any
import logging

logger = logging.getLogger(__name__)

class DynamicConfig:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DynamicConfig, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
            
        self.uri = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/fueture_db")
        if "fueture_db" not in self.uri:
            if self.uri.endswith("/"):
                self.uri += "fueture_db"
            else:
                self.uri += "/fueture_db"
                
        try:
            # 🛡️ RESILIENT INITIALIZATION
            self.client = pymongo.MongoClient(self.uri, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
            self.db_name = os.getenv("DB_NAME", "fueture_db")
            self.db = self.client[self.db_name]
            self.collection = self.db["systemsettings"]
            self.is_db_active = True
            logger.info(f"DynamicConfig Linked to DB: {self.db_name}")
        except Exception as e:
            self.is_db_active = False
            logger.warning(f"DynamicConfig DB Offline (Using ENV fallback): {e}")

        self._initialized = True

    def get(self, key: str, fallback: Any = None) -> Any:
        # 1. Try DB if active
        if self.is_db_active:
            try:
                setting = self.collection.find_one({"key": key})
                if setting:
                    return setting.get("value", fallback)
            except Exception as e:
                logger.debug(f"DB Fetch skipped for {key} due to connectivity pulse.")
        
        # 2. Fallback to ENV
        env_val = os.getenv(key)
        if env_val:
            return env_val
            
        return fallback

# Global singleton instance
config = DynamicConfig()
