import logging
from pathlib import Path
import numpy as np
import pandas as pd
import rasterio
from rasterio.transform import rowcol

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s"
)
DATASET = Path(
    "data/processed/talcher_training_dataset.csv"
)
WORLD_COVER_DIR = Path(
    "data/raw/worldcover"
)
N18_TILE = WORLD_COVER_DIR / (
    "ESA_WorldCover_10m_2021_v200_N18E084_Map.tif"
)
N21_TILE = WORLD_COVER_DIR / (
    "ESA_WorldCover_10m_2021_v200_N21E084_Map.tif"
)

def load_dataset():
    logging.info("Loading training dataset")
    df = pd.read_csv(DATASET)
    logging.info(
        f"Dataset shape: {df.shape}"
    )
    return df

def extract_from_tile(df, raster_path, min_lat, max_lat):
    logging.info(
        f"Processing tile: {raster_path.name}"
    )
    mask = (
        (df["latitude"] >= min_lat)
        & (df["latitude"] < max_lat)
    )
    indices = df.index[mask]
    if len(indices) == 0:
        logging.info("No points fall inside this tile")
        return df
    with rasterio.open(raster_path) as src:
        if src.crs is None:
            raise ValueError(
                f"Raster has no CRS: {raster_path}"
            )
        if src.crs.to_string() != "EPSG:4326":
            raise ValueError(
                f"Expected EPSG:4326 raster, "
                f"got {src.crs}"
            )
        rows, cols = rowcol(
            src.transform,
            df.loc[indices, "longitude"].values,
            df.loc[indices, "latitude"].values
        )
        rows = np.asarray(rows)
        cols = np.asarray(cols)
        valid = (
            (rows >= 0)
            & (rows < src.height)
            & (cols >= 0)
            & (cols < src.width)
        )
        values = np.zeros(
            len(indices),
            dtype=np.int16
        )
        if valid.any():
            values[valid] = src.read(
                1
            )[rows[valid], cols[valid]]
        df.loc[indices, "landcover_class"] = values
    logging.info(
        f"Processed {len(indices)} points"
    )
    return df

def main():
    df = load_dataset()
    logging.info(
        "Existing landcover distribution:"
    )
    print(
        df["landcover_class"]
        .value_counts()
        .sort_index()
    )
    df = extract_from_tile(
        df,
        N18_TILE,
        18.0,
        21.0
    )
    df = extract_from_tile(
        df,
        N21_TILE,
        21.0,
        24.0
    )
    df["landcover_class"] = (
        pd.to_numeric(
            df["landcover_class"],
            errors="coerce"
        )
        .fillna(0)
        .astype(int)
    )
    logging.info(
        "Updated landcover distribution:"
    )
    print(
        df["landcover_class"]
        .value_counts()
        .sort_index()
    )
    nodata = (
        df["landcover_class"] == 0
    ).sum()
    logging.info(
        f"Remaining landcover value 0: {nodata}"
    )
    df.to_csv(
        DATASET,
        index=False
    )
    logging.info(
        f"Updated dataset saved to {DATASET}"
    )

if __name__ == "__main__":
    main()