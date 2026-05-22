import pandas as pd
import numpy as np
from typing import Dict, Any, List
import io

class DataScientist:
    """
    Advanced Data Analysis Module.
    Uses Pandas/Numpy for Statistical Analysis, Filtering, and Formatting.
    """
    
    @staticmethod
    def analyze_dataset(df: pd.DataFrame) -> Dict[str, Any]:
        """
        Performs a Deep Scan of the dataset.
        DSA: O(n) traversals for stats.
        """
        analysis = {}
        
        # 1. Structure Analysis
        analysis["shape"] = df.shape
        analysis["columns"] = list(df.columns)
        analysis["dtypes"] = {k: str(v) for k, v in df.dtypes.items()}
        
        # 2. Missing Value Matrix
        missing = df.isnull().sum().to_dict()
        analysis["missing_values"] = missing
        
        # 3. Numeric Profiling (Distribution, Outliers)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) > 0:
            stats = df[numeric_cols].describe().to_dict()
            analysis["statistics"] = stats
            
            # Outlier Detection (IQR Method) - Algorithmic
            outliers = {}
            for col in numeric_cols:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR
                outlier_count = ((df[col] < lower) | (df[col] > upper)).sum()
                if outlier_count > 0:
                    outliers[col] = int(outlier_count)
            analysis["outliers_detected"] = outliers

        # 4. Correlation Matrix (Machine Learning Prep)
        if len(numeric_cols) > 1:
            corr = df[numeric_cols].corr()
            # Filter Strong Correlations
            strong_corr = []
            for i in range(len(corr.columns)):
                for j in range(i):
                    if abs(corr.iloc[i, j]) > 0.7:
                        strong_corr.append({
                            "pair": [corr.columns[i], corr.columns[j]],
                            "value": round(corr.iloc[i, j], 3)
                        })
            analysis["strong_correlations"] = strong_corr
            
        return analysis

    @staticmethod
    def smart_filter(df: pd.DataFrame, query: str = "") -> pd.DataFrame:
        """
        Auto-Understanding Filter.
        Tries to accept natural language-ish queries or standard SQL-like logic.
        """
        # Placeholder for NLP filtering. For now, basic cleaning.
        # Drop empty rows/cols
        cleaned = df.dropna(how='all')
        return cleaned

# Singleton
ds_engine = DataScientist()
