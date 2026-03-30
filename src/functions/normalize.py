import pandas as pd

def normalize_column_names(df):
    df_cleaned = df.copy()
    df_cleaned.columns = (
        df_cleaned.columns.str.lower()     # Minúsculas
        .str.strip()                       # Sin espacios externos
        .str.replace(" ", "_")             # Reemplazo por guiones bajos
        .str.replace('[^0-9a-zA-Z_]', '', regex=True)  # Elimina caracteres especiales
    )
    return df_cleaned