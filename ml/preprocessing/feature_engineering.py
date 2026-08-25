import os
import logging
import pandas as pd
import geopandas as gpd
import rasterio

from shapely.geometry import Point
from sklearn.neighbors import BallTree
import numpy as np


logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s"
)


FIRMS_FILE = "data/processed/talcher_firms.csv"

OSM_DIR = "data/raw/osm"

INDUSTRY_FILES = [
    "angul_talcher_industries.geojson",
    "industrial_use.geojson"
]

POWER_FILE = "power_plants.geojson"
MINE_FILE = "mines.geojson"

FLARE_FILE = "data/processed/flare_combined_2012_2019.csv"

WORLD_COVER_FILE = (
    "data/raw/worldcover/"
    "ESA_WorldCover_10m_2021_v200_N18E084_Map.tif"
)

OUTPUT_FILE = "data/processed/talcher_features.csv"


def load_firms():

    logging.info("Loading FIRMS dataset")

    df = pd.read_csv(FIRMS_FILE)

    df["acq_date"] = pd.to_datetime(df["acq_date"])

    df["month"] = df["acq_date"].dt.month

    df["hour"] = (
        df["acq_time"]
        .astype(str)
        .str[:2]
        .astype(int)
    )

    geometry = [
        Point(x, y)
        for x, y in zip(
            df.longitude,
            df.latitude
        )
    ]

    gdf = gpd.GeoDataFrame(
        df,
        geometry=geometry,
        crs="EPSG:4326"
    )

    return gdf



def calculate_nearest_distance(points, targets):

    points = points.to_crs("EPSG:4326")
    targets = targets.to_crs("EPSG:4326")

    targets = targets.copy()

    targets["geometry"] = targets.geometry.centroid

    point_coords = np.radians(
        np.c_[
            points.geometry.y,
            points.geometry.x
        ]
    )

    target_coords = np.radians(
        np.c_[
            targets.geometry.y,
            targets.geometry.x
        ]
    )

    tree = BallTree(
        target_coords,
        metric="haversine"
    )

    distances, _ = tree.query(
        point_coords,
        k=1
    )

    earth_radius = 6371000

    return distances[:, 0] * earth_radius

def load_osm_file(path):

    return gpd.read_file(path)



def add_industry_distance(gdf):

    logging.info("Calculating industry distance")

    layers = []

    for file in INDUSTRY_FILES:

        path = os.path.join(
            OSM_DIR,
            file
        )

        layers.append(
            load_osm_file(path)
        )

    industries = gpd.GeoDataFrame(
        pd.concat(
            layers,
            ignore_index=True
        ),
        crs="EPSG:4326"
    )

    gdf["distance_to_industry"] = (
        calculate_nearest_distance(
            gdf,
            industries
        )
    )

    return gdf



def add_power_distance(gdf):

    logging.info("Calculating power plant distance")

    power = load_osm_file(
        os.path.join(
            OSM_DIR,
            POWER_FILE
        )
    )

    gdf["distance_to_powerplant"] = (
        calculate_nearest_distance(
            gdf,
            power
        )
    )

    return gdf



def add_mine_distance(gdf):

    logging.info("Calculating mine distance")

    mines = load_osm_file(
        os.path.join(
            OSM_DIR,
            MINE_FILE
        )
    )

    gdf["distance_to_mine"] = (
        calculate_nearest_distance(
            gdf,
            mines
        )
    )

    return gdf



def add_flare_distance(gdf):

    logging.info("Calculating flare distance")

    flare = pd.read_csv(
        FLARE_FILE
    )

    flare_geometry = [
        Point(x, y)
        for x, y in zip(
            flare.longitude,
            flare.latitude
        )
    ]

    flare_gdf = gpd.GeoDataFrame(
        flare,
        geometry=flare_geometry,
        crs="EPSG:4326"
    )

    gdf["distance_to_known_flare"] = (
        calculate_nearest_distance(
            gdf,
            flare_gdf
        )
    )

    return gdf



def add_landcover(gdf):

    logging.info("Extracting WorldCover classes")

    values = []

    with rasterio.open(
        WORLD_COVER_FILE
    ) as src:

        for point in gdf.geometry:

            try:

                sample = list(
                    src.sample(
                        [
                            (
                                point.x,
                                point.y
                            )
                        ]
                    )
                )[0][0]

                values.append(
                    int(sample)
                )

            except:

                values.append(0)

    gdf["landcover_class"] = values

    return gdf



def main():

    gdf = load_firms()

    gdf = add_industry_distance(gdf)

    gdf = add_power_distance(gdf)

    gdf = add_mine_distance(gdf)

    gdf = add_flare_distance(gdf)

    gdf = add_landcover(gdf)


    output = gdf.drop(
        columns="geometry"
    )

    output.to_csv(
        OUTPUT_FILE,
        index=False
    )


    logging.info(
        f"Saved dataset: {OUTPUT_FILE}"
    )

    logging.info(
        f"Shape: {output.shape}"
    )

    logging.info(
        output.isna().sum()
    )


if __name__ == "__main__":
    main()