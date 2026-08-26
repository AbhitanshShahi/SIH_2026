import logging
from pathlib import Path
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score
)
from sklearn.preprocessing import LabelEncoder

from xgboost import XGBClassifier
from lightgbm import LGBMClassifier


logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s"
)


DATASET = Path(
    "data/processed/talcher_training_dataset.csv"
)

MODEL_DIR = Path(
    "ml/models"
)

RESULT_DIR = Path(
    "ml/results"
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

RESULT_DIR.mkdir(
    parents=True,
    exist_ok=True
)


TARGET = "thermal_source_class"

DROP_COLUMNS = [
    TARGET,
    "latitude",
    "longitude",
    "type",
    "instrument",
    "acq_date",
    "acq_time",
    "distance_to_industry",
    "distance_to_powerplant",
    "distance_to_mine",
    "distance_to_known_flare"
]

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


def temporal_split(df):
    logging.info("Creating temporal split")

    train_df = df[
        df["acq_date"] < "2025-01-01"
    ].copy()

    test_df = df[
        df["acq_date"] >= "2025-01-01"
    ].copy()

    logging.info(
        f"Training period: "
        f"{train_df['acq_date'].min()} "
        f"to "
        f"{train_df['acq_date'].max()}"
    )

    logging.info(
        f"Testing period: "
        f"{test_df['acq_date'].min()} "
        f"to "
        f"{test_df['acq_date'].max()}"
    )

    return train_df, test_df


def prepare_features(train_df, test_df):
    logging.info("Preparing features")

    X_train = train_df.drop(
        columns=DROP_COLUMNS,
        errors="ignore"
    ).copy()

    X_test = test_df.drop(
        columns=DROP_COLUMNS,
        errors="ignore"
    ).copy()

    y_train = train_df[TARGET].copy()
    y_test = test_df[TARGET].copy()

    categorical_columns = X_train.select_dtypes(
        include=["object"]
    ).columns.tolist()

    logging.info(
        f"Categorical columns: {categorical_columns}"
    )

    encoders = {}

    for col in categorical_columns:
        encoder = LabelEncoder()

        X_train[col] = encoder.fit_transform(
            X_train[col].astype(str)
        )

        known_values = set(
            encoder.classes_
        )

        X_test_values = X_test[col].astype(str)

        X_test[col] = X_test_values.map(
            lambda value: (
                encoder.transform([value])[0]
                if value in known_values
                else -1
            )
        )

        encoders[col] = encoder

    logging.info(
        f"Final features: {list(X_train.columns)}"
    )

    return (
        X_train,
        X_test,
        y_train,
        y_test,
        encoders
    )


def create_models():
    return {
        "Random Forest": RandomForestClassifier(
            n_estimators=300,
            random_state=42,
            class_weight="balanced",
            n_jobs=-1
        ),

        "XGBoost": XGBClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=8,
            subsample=0.8,
            colsample_bytree=0.8,
            objective="multi:softprob",
            num_class=3,
            random_state=42,
            eval_metric="mlogloss"
        ),

        "LightGBM": LGBMClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=8,
            class_weight="balanced",
            random_state=42,
            verbosity=-1
        )
    }


def train_models(models, X_train, y_train):
    trained_models = {}

    logging.info("Training models")

    for name, model in models.items():

        logging.info(
            f"Training {name}"
        )

        model.fit(
            X_train,
            y_train
        )

        trained_models[name] = model

    return trained_models


def evaluate_models(
    models,
    X_test,
    y_test
):
    results = []

    report_path = (
        RESULT_DIR /
        "model_comparison.txt"
    )

    with open(
        report_path,
        "w",
        encoding="utf-8"
    ) as report_file:

        for name, model in models.items():

            logging.info(
                f"Evaluating {name}"
            )

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

            classification = classification_report(
                y_test,
                predictions,
                zero_division=0
            )

            matrix = confusion_matrix(
                y_test,
                predictions
            )

            print()
            print("=" * 60)
            print(name)
            print("=" * 60)
            print(classification)
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

            report_file.write(
                "\n"
                + "=" * 60
                + "\n"
                + name
                + "\n"
                + "=" * 60
                + "\n"
            )

            report_file.write(
                classification
            )

            report_file.write(
                "\nConfusion Matrix:\n"
            )

            report_file.write(
                str(matrix)
            )

            report_file.write(
                f"\nAccuracy: {accuracy:.4f}\n"
            )

            report_file.write(
                f"Macro Precision: {precision:.4f}\n"
            )

            report_file.write(
                f"Macro Recall: {recall:.4f}\n"
            )

            report_file.write(
                f"Macro F1: {f1:.4f}\n"
            )

            results.append(
                {
                    "Model": name,
                    "Accuracy": accuracy,
                    "Macro Precision": precision,
                    "Macro Recall": recall,
                    "Macro F1": f1
                }
            )

    results_df = pd.DataFrame(
        results
    )

    results_df = results_df.sort_values(
        by="Macro F1",
        ascending=False
    ).reset_index(drop=True)

    comparison_path = (
        RESULT_DIR /
        "model_comparison.csv"
    )

    results_df.to_csv(
        comparison_path,
        index=False
    )

    print()
    print("=" * 60)
    print("FINAL MODEL COMPARISON")
    print("=" * 60)
    print(results_df.to_string(index=False))

    return results_df

def save_models(models):
    logging.info("Saving models")
    model_paths = {
        "Random Forest":
            MODEL_DIR / "random_forest_final.joblib",
        "XGBoost":
            MODEL_DIR / "xgboost_final.joblib",
        "LightGBM":
            MODEL_DIR / "lightgbm_final.joblib"
    }
    for name, model in models.items():
        path = model_paths[name]
        joblib.dump(
            model,
            path
        )
        logging.info(
            f"{name} saved to {path}"
        )

def save_encoders(encoders):
    encoder_path = (
        MODEL_DIR /
        "feature_encoders.joblib"
    )
    joblib.dump(
        encoders,
        encoder_path
    )
    logging.info(
        f"Feature encoders saved to {encoder_path}"
    )

def main():
    df = load_data()
    train_df, test_df = temporal_split(
        df
    )
    (
        X_train,
        X_test,
        y_train,
        y_test,
        encoders
    ) = prepare_features(
        train_df,
        test_df
    )
    logging.info(
        f"Train samples: {len(X_train)}"
    )
    logging.info(
        f"Test samples: {len(X_test)}"
    )
    models = create_models()
    trained_models = train_models(
        models,
        X_train,
        y_train
    )
    results = evaluate_models(
        trained_models,
        X_test,
        y_test
    )
    save_models(
        trained_models
    )
    save_encoders(
        encoders
    )
    best_model = results.iloc[0]
    logging.info(
        f"Best model by Macro F1: "
        f"{best_model['Model']}"
    )
    logging.info(
        "Training and evaluation completed"
    )
if __name__ == "__main__":
    main()