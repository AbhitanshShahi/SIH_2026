import pandas as pd
from pathlib import Path
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s"
)
INPUT_FILE = Path(
    "data/processed/talcher_features.csv"
)
OUTPUT_FILE = Path(
    "data/processed/talcher_training_dataset.csv"
)
def load_dataset():
    logging.info("Loading feature dataset")
    df = pd.read_csv(INPUT_FILE)
    logging.info(f"Loaded rows: {len(df)}")
    return df
def create_labels(df):

    logging.info("Creating thermal source labels")

    df["thermal_source_class"] = 0

    # Class 1: Industrial aag
    industrial_condition = (
        (
            (df["distance_to_industry"] <= 500)
            |
            (df["distance_to_powerplant"] <= 2000)
            |
            (df["distance_to_mine"] <= 1000)
        )
        &
        (df["frp"] >= 3.57)
    )

    df.loc[
        industrial_condition,
        "thermal_source_class"
    ] = 1

    # Class 2: Flare-like
    flare_condition = (
        (df["distance_to_known_flare"] <= 5000)
        &
        (df["frp"] >= 5)
    )

    df.loc[
        flare_condition,
        "thermal_source_class"
    ] = 2


    logging.info("Labels created")

    return df

def save_dataset(df):

    logging.info("Saving labelled dataset")

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    logging.info(
        f"Saved: {OUTPUT_FILE}"
    )

def show_distribution(df):
    logging.info("Class distribution")
    counts = (
        df["thermal_source_class"]
        .value_counts()
        .sort_index()
    )

    print("\nClass Counts")
    print("----------------")

    for cls, count in counts.items():

        percentage = (
            count / len(df)
        ) * 100

        print(
            f"Class {cls}: {count} ({percentage:.2f}%)"
        )

def main():

    df = load_dataset()

    df = create_labels(df)

    show_distribution(df)

    save_dataset(df)


if __name__ == "__main__":
    main()