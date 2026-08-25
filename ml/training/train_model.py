import pandas as pd
import logging
from pathlib import Path
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

from xgboost import XGBClassifier


logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s"
)


DATASET = Path(
    "data/processed/talcher_training_dataset.csv"
)

MODEL_PATH = Path(
    "ml/models/xgboost_final.pkl"
)

RESULT_PATH = Path(
    "ml/results/xgboost_temporal_results.txt"
)


MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

RESULT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)


def load_data():

    logging.info("Loading dataset")

    df = pd.read_csv(DATASET)

    logging.info(
        f"Dataset shape: {df.shape}"
    )

    df["acq_date"] = pd.to_datetime(
        df["acq_date"]
    )

    return df



def preprocess_data(df):

    logging.info("Preprocessing features")


    target = "thermal_source_class"


    drop_columns = [

        target,

        # location leakage/generalization
        "latitude",
        "longitude",

        # direct FIRMS classification leakage
        "type",
        "instrument",

        # raw date handled separately
        "acq_date",
        "acq_time",

        # label generation features
        "distance_to_industry",
        "distance_to_powerplant",
        "distance_to_mine",
        "distance_to_known_flare"
    ]


    X = df.drop(
        columns=drop_columns,
        errors="ignore"
    )


    y = df[target]


    categorical_columns = X.select_dtypes(
        include=["object"]
    ).columns


    logging.info(
        f"Categorical columns: {list(categorical_columns)}"
    )


    for col in categorical_columns:

        encoder = LabelEncoder()

        X[col] = encoder.fit_transform(
            X[col].astype(str)
        )
        logging.info(
            f"Final features: {list(X.columns)}"
            )

    return X, y

def temporal_split(df):

    logging.info("Creating temporal split")


    train_df = df[
        df["acq_date"] < "2025-01-01"
    ]


    test_df = df[
        df["acq_date"] >= "2025-01-01"
    ]


    logging.info(
        f"Training period: {train_df['acq_date'].min()} to {train_df['acq_date'].max()}"
    )

    logging.info(
        f"Testing period: {test_df['acq_date'].min()} to {test_df['acq_date'].max()}"
    )


    return train_df, test_df



def train_model(X_train, y_train):

    logging.info("Training XGBoost")


    model = XGBClassifier(

        n_estimators=300,

        learning_rate=0.05,

        max_depth=8,

        subsample=0.8,

        colsample_bytree=0.8,

        objective="multi:softprob",

        num_class=3,

        random_state=42,

        eval_metric="mlogloss"
    )


    model.fit(
        X_train,
        y_train
    )


    return model



def evaluate(model, X_test, y_test):

    logging.info("Evaluating model")


    predictions = model.predict(
        X_test
    )


    accuracy = accuracy_score(
        y_test,
        predictions
    )


    precision = precision_score(
        y_test,
        predictions,
        average="macro",
        zero_division=0
    )


    recall = recall_score(
        y_test,
        predictions,
        average="macro",
        zero_division=0
    )


    f1 = f1_score(
        y_test,
        predictions,
        average="macro",
        zero_division=0
    )


    report = classification_report(
        y_test,
        predictions
    )


    matrix = confusion_matrix(
        y_test,
        predictions
    )


    print("=" * 50)
    print("XGBoost Temporal Evaluation")
    print("=" * 50)

    print(report)

    print("Confusion Matrix:")
    print(matrix)


    print(
        f"Accuracy: {accuracy:.4f}"
    )

    print(
        f"Macro Precision: {precision:.4f}"
    )

    print(
        f"Macro Recall: {recall:.4f}"
    )

    print(
        f"Macro F1: {f1:.4f}"
    )


    with open(
        RESULT_PATH,
        "w"
    ) as f:

        f.write(report)

        f.write(
            "\n\nConfusion Matrix\n"
        )

        f.write(
            str(matrix)
        )


    return f1



def main():

    df = load_data()


    train_df, test_df = temporal_split(
        df
    )


    X_train, y_train = preprocess_data(
        train_df
    )


    X_test, y_test = preprocess_data(
        test_df
    )


    logging.info(
        f"Train samples: {len(X_train)}"
    )

    logging.info(
        f"Test samples: {len(X_test)}"
    )


    model = train_model(
        X_train,
        y_train
    )


    evaluate(
        model,
        X_test,
        y_test
    )


    joblib.dump(
        model,
        MODEL_PATH
    )


    logging.info(
        "Model saved successfully"
    )



if __name__ == "__main__":

    main()