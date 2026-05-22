import time
from functools import wraps
from utils.logger import get_logger

logger = get_logger(__name__)

def time_execution(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        logger.info(f"Function {func.__name__} took {end_time - start_time:.4f} seconds")
        return result
    return wrapper
