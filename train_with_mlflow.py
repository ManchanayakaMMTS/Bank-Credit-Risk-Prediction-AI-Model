import os
import json
import time
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import average_precision_score, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

import mlflow
import mlflow.sklearn


SEED = 42
EXPERIMENT_NAME = "credit-risk-xgb"
ARTIFACT_DIR = Path("model")
ARTIFACT_DIR.mkdir(exist_ok=True)


def configure_mlflow() -> None:
    mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "mlruns"))
    mlflow.set_experiment(EXPERIMENT_NAME)


def load_data() -> tuple[pd.DataFrame, np.ndarray]:
    rng = np.random.default_rng(SEED)
    n = 5000
    df = pd.DataFrame(
        {
            "person_age": rng.integers(18, 75, n),
            "person_income": rng.integers(10000, 200000, n),
            "person_emp_length": rng.integers(0, 40, n),
            "loan_amnt": rng.integers(500, 50000, n),
            "loan_int_rate": rng.uniform(3, 28, n).round(2),
            "loan_percent_income": rng.uniform(0.01, 1.5, n).round(2),
            "cb_person_cred_hist_length": rng.integers(0, 30, n),
            "person_home_ownership": rng.choice(
                ["RENT", "OWN", "MORTGAGE", "OTHER"], n
            ),
            "loan_intent": rng.choice(
                [
                    "DEBTCONSOLIDATION",
                    "EDUCATION",
                    "HOMEIMPROVEMENT",
                    "MEDICAL",
                    "PERSONAL",
                    "VENTURE",
                ],
                n,
            ),
            "loan_grade": rng.choice(list("ABCDEFG"), n),
            "cb_person_default_on_file": rng.choice(["N", "Y"], n, p=[0.9, 0.1]),
        }
    )
    y = (
        (df["loan_percent_income"] > 0.6).astype(int)
        | (df["cb_person_default_on_file"] == "Y").astype(int)
        | (df["loan_int_rate"] > 20).astype(int)
    ).astype(int)
    return df, y.to_numpy()


NUM_COLS = [
    "person_age",
    "person_income",
    "person_emp_length",
    "loan_amnt",
    "loan_int_rate",
    "loan_percent_income",
    "cb_person_cred_hist_length",
]

CAT_COLS = [
    "person_home_ownership",
    "loan_intent",
    "loan_grade",
    "cb_person_default_on_file",
]


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(with_mean=True, with_std=True), NUM_COLS),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CAT_COLS,
            ),
        ],
        remainder="drop",
    )


def main() -> None:
    configure_mlflow()
    df, y = load_data()
    X_train, X_test, y_train, y_test = train_test_split(
        df, y, test_size=0.2, random_state=SEED, stratify=y
    )

    preprocessor = build_preprocessor()
    model = XGBClassifier(
        n_estimators=400,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        tree_method="hist",
        random_state=SEED,
        n_jobs=4,
    )

    with mlflow.start_run(run_name=f"xgb_{int(time.time())}"):
        mlflow.log_params(
            {
                "n_estimators": model.n_estimators,
                "max_depth": model.max_depth,
                "learning_rate": model.learning_rate,
                "subsample": model.subsample,
                "colsample_bytree": model.colsample_bytree,
                "tree_method": model.tree_method,
                "seed": SEED,
            }
        )

        # Fit preprocessor and transform data
        X_train_proc = preprocessor.fit_transform(X_train)
        X_test_proc = preprocessor.transform(X_test)

        # Fit model on processed features
        model.fit(X_train_proc, y_train)

        y_prob = model.predict_proba(X_test_proc)[:, 1]
        y_pred = (y_prob >= 0.5).astype(int)

        auc = roc_auc_score(y_test, y_prob)
        ap = average_precision_score(y_test, y_prob)
        f1 = f1_score(y_test, y_pred)

        mlflow.log_metrics({"auc": auc, "ap": ap, "f1": f1})

        # Save artifacts for Flask app
        joblib.dump(preprocessor, ARTIFACT_DIR / "preprocessor.joblib")
        joblib.dump(model, ARTIFACT_DIR / "final_xgb_model.joblib")

        mlflow.log_artifact(str(ARTIFACT_DIR / "preprocessor.joblib"), artifact_path="artifacts")
        mlflow.log_artifact(str(ARTIFACT_DIR / "final_xgb_model.joblib"), artifact_path="artifacts")

        # Log the model (sklearn flavor) — wrap a dict with steps for reference
        mlflow.sklearn.log_model(model, artifact_path="model")

        schema = {
            "numerical": NUM_COLS,
            "categorical": CAT_COLS,
            "target": "default",
        }
        schema_path = ARTIFACT_DIR / "input_schema.json"
        with open(schema_path, "w") as f:
            json.dump(schema, f, indent=2)
        mlflow.log_artifact(str(schema_path), artifact_path="artifacts")

        print(f"Logged run. AUC={auc:.4f}, AP={ap:.4f}, F1={f1:.4f}")
        print(f"Artifacts saved to {ARTIFACT_DIR}/ and tracked in MLflow.")


if __name__ == "__main__":
    main()


