# CLAUDE.md — ML Model Development

> Author: Melisia Archimedes
> Version: 1.0
> Stack: PyTorch, MLflow, DVC, scikit-learn, pandas, Docker

## Project Overview

This configuration governs machine learning model development projects — from feature engineering through training to production serving. The emphasis is on reproducibility, experiment tracking, and preventing data leakage. ML projects fail most often from data problems, not model architecture problems. This file reflects that reality.

## Project Structure

```
├── data/
│   ├── raw/                          # Immutable raw data (DVC-tracked)
│   ├── processed/                    # Cleaned, feature-engineered data
│   ├── external/                     # Third-party reference data
│   └── splits/                       # Train/val/test splits (versioned)
├── src/
│   ├── data/
│   │   ├── __init__.py
│   │   ├── dataset.py                # PyTorch Dataset classes
│   │   ├── preprocessing.py          # Cleaning, imputation, encoding
│   │   ├── feature_engineering.py    # Feature creation pipelines
│   │   └── validation.py             # Data quality checks
│   ├── models/
│   │   ├── __init__.py
│   │   ├── architectures.py          # Model definitions
│   │   ├── training.py               # Training loops
│   │   ├── evaluation.py             # Metrics, evaluation logic
│   │   └── inference.py              # Prediction pipelines
│   ├── pipelines/
│   │   ├── train_pipeline.py         # End-to-end training
│   │   ├── eval_pipeline.py          # Evaluation on held-out data
│   │   └── serve_pipeline.py         # Serving setup
│   └── utils/
│       ├── config.py                 # Hydra/YAML config management
│       ├── logging.py                # Structured logging setup
│       └── reproducibility.py        # Seed setting, determinism
├── configs/
│   ├── train.yaml                    # Training hyperparameters
│   ├── data.yaml                     # Data paths, split ratios
│   └── model.yaml                    # Architecture configuration
├── notebooks/
│   ├── 01_eda.ipynb                  # Exploratory data analysis
│   ├── 02_feature_analysis.ipynb     # Feature importance, correlations
│   └── 03_error_analysis.ipynb       # Model error deep dive
├── tests/
│   ├── test_preprocessing.py
│   ├── test_features.py
│   ├── test_model.py
│   └── test_pipeline.py
├── serving/
│   ├── Dockerfile                    # Model serving container
│   ├── app.py                        # FastAPI serving endpoint
│   └── model_config.yaml             # TorchServe/Triton config
├── dvc.yaml                          # DVC pipeline definition
├── dvc.lock                          # DVC pipeline state
├── pyproject.toml
└── .env.example
```

## Naming Conventions

- **Experiments:** `[model_type]-[dataset]-[date]-[description]` (`resnet50-imagenet-20240315-baseline`)
- **Model artifacts:** `model-[version].pt` for PyTorch, stored in MLflow model registry
- **Feature columns:** `[source]_[description]_[transform]` (`user_purchase_count_log`, `product_price_normalized`)
- **Metrics:** standard names — `accuracy`, `f1_macro`, `rmse`, `auc_roc` (never abbreviate inconsistently)
- **Config files:** YAML, grouped by concern (`train.yaml`, `data.yaml`, `model.yaml`)
- **Notebooks:** numbered prefix for execution order (`01_eda.ipynb`, `02_feature_analysis.ipynb`)
- **DVC stages:** verb-noun (`process-data`, `train-model`, `evaluate-model`)

## Data Management

### Data Versioning (DVC)
- All raw data is tracked by DVC, not Git (large files do not belong in Git)
- DVC remote storage: S3 bucket or GCS bucket (configure in `.dvc/config`)
- Every data change creates a new DVC version — pin dataset versions in experiment configs
- Never modify raw data. Transformations produce new files in `data/processed/`
- `dvc.yaml` defines the full pipeline: data processing, training, evaluation

### Data Splits
- Define splits once, version them, reuse across experiments
- Split ratios: 70/15/15 (train/validation/test) as default — adjust per project
- Stratify splits for classification tasks
- Time-based splits for time series — never randomly shuffle time series data
- The test set is touched only for final evaluation, never during development
- Hold out a separate "challenge" set for pre-deployment validation if possible

### Data Quality
- Validate data before training: check for nulls, outliers, class imbalance, duplicate rows
- Log data statistics (mean, std, min, max, null count) per feature in MLflow
- Schema validation: column names, types, and value ranges must match expectations
- Alert on distribution drift between training data and new data batches

## Feature Engineering Rules

- All feature transforms must be implemented as scikit-learn Transformers or PyTorch transforms — never as loose functions applied ad hoc
- Fit transforms on training data only. Apply (transform) to validation and test sets. This prevents data leakage.
- Store fitted transformers alongside the model artifact (pickle or joblib)
- Document every feature: source, business meaning, transform applied, expected range
- Log feature importance after training — features with zero importance should be investigated

```python
# CORRECT — fit on train, transform on val/test
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)

# WRONG — fitting on full dataset leaks test distribution info
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_all)
X_train_scaled, X_val_scaled, X_test_scaled = split(X_scaled)
```

## Experiment Tracking (MLflow)

- Every training run logs to MLflow — no exceptions, even for "quick tests"
- Log parameters: all hyperparameters, data version (DVC hash), split ratios, random seed
- Log metrics: training loss per epoch, validation metrics, final test metrics
- Log artifacts: trained model, config file, feature importance plot, confusion matrix
- Tag experiments with meaningful labels: `baseline`, `architecture_search`, `production_candidate`
- Model registry: promote models through stages — `None` to `Staging` to `Production`
- Never overwrite a registered model version — create a new version

### What Must Be Logged

| Category | Examples |
|----------|---------|
| Parameters | learning_rate, batch_size, epochs, hidden_dim, dropout, optimizer, data_version |
| Metrics | train_loss, val_loss, val_accuracy, val_f1, test_accuracy (final only) |
| Artifacts | model.pt, config.yaml, feature_importance.png, confusion_matrix.png |
| Tags | experiment_type, author, dataset_version, git_commit_hash |

## Training Rules

- Set random seeds for reproducibility: Python, NumPy, PyTorch, CUDA (document in config)
- Use early stopping on validation loss — patience of 5-10 epochs depending on dataset size
- Save the best model checkpoint (by validation metric), not the last epoch
- Log training curves (loss and metric per epoch) — review for overfitting before promoting
- GPU memory: clear cache between experiments (`torch.cuda.empty_cache()`), use gradient accumulation for large batches
- Mixed precision training (`torch.cuda.amp`) by default for GPU training — significant speedup with minimal quality loss
- Never train on the test set. Never tune hyperparameters using test set metrics.

## Hyperparameter Tuning

- Use Optuna or Ray Tune for systematic hyperparameter search
- Define the search space in config, not in code
- Optimise validation metrics, never test metrics
- Log every trial to MLflow (Optuna integration handles this)
- Start with a coarse random search, then refine with Bayesian optimisation
- Budget: define a maximum number of trials or wall-clock time before starting

## Model Serving

### Serving Options
- **FastAPI + Docker:** for custom serving logic, preprocessing pipelines, multi-model routing
- **TorchServe:** for PyTorch models with standard inference patterns
- **Triton Inference Server:** for high-throughput, multi-framework serving

### Serving Rules
- The serving container must include all preprocessing (feature transforms, scaling, encoding)
- Model loading happens once at startup, not per request
- Input validation on every request — reject malformed inputs with a 400 error
- Response includes prediction, confidence score, and model version
- Health endpoint: `/health` returns 200 with model version and load status
- Latency target: P95 under 100ms for real-time serving (define per project)
- Batch prediction: separate pipeline for offline scoring, not the real-time endpoint

## Testing Requirements

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | pytest | 90% of src/ | Preprocessing, feature engineering, data validation |
| Transform | pytest | All transforms | Fit/transform correctness, edge cases (nulls, empty) |
| Model | pytest | Architecture | Model forward pass shape, output range, gradient flow |
| Pipeline | pytest | End-to-end | Train on tiny dataset, verify metrics are computed |
| Serving | pytest + httpx | All endpoints | Prediction endpoint, input validation, error handling |
| Data | Great Expectations | Raw data | Schema, freshness, distributions |

- Test transforms with known inputs and expected outputs
- Test model output shape: given input shape X, model should output shape Y
- Test pipeline end-to-end with a tiny dataset (10-100 samples) — verify it runs without error
- Never test with production data in CI — use synthetic or sampled datasets

## Security Rules

1. **Data leakage prevention:** Fit all transforms on training data only. Time series: no future data in features. Cross-validation: no information from fold N in fold M preprocessing.
2. **Model poisoning:** Validate training data quality. Log data checksums. Alert on unexpected data distribution changes.
3. **Data access:** Raw data access restricted to the ML team. Processed/anonymised data available to broader team.
4. **Model artifacts:** Stored in a secure model registry (MLflow with access controls). Production models are immutable once registered.
5. **Serving security:** Authentication on prediction endpoints. Rate limiting. Input size limits to prevent resource exhaustion.
6. **PII in training data:** Audit training features for PII. Remove or hash PII features unless they are essential and approved.
7. **Dependency pinning:** Pin all Python package versions in `pyproject.toml`. ML frameworks have breaking changes between minor versions.

## Common Pitfalls

- **Data leakage.** The single most common ML project failure. Leakage happens when information from the test set influences training — through preprocessing, feature engineering, or temporal ordering. Audit the pipeline for leakage before trusting results.
- **Not versioning data.** Code versioning without data versioning means experiments are not reproducible. DVC or a similar tool is mandatory.
- **Evaluating on training data.** Metrics on training data are meaningless for generalisation. Always report validation and test metrics.
- **Ignoring class imbalance.** Accuracy of 95% on a dataset where 95% of samples are one class means the model learned nothing. Use F1, AUC-ROC, or precision-recall curves for imbalanced datasets.
- **Feature engineering after splitting.** Fit transforms before splitting creates leakage. Split first, then fit on training data only.
- **Notebooks as production code.** Notebooks are for exploration. Production training pipelines are `.py` files with proper error handling, logging, and tests. Extract code from notebooks into `src/` once validated.
- **No experiment tracking for "quick" tests.** Every run gets logged. The "quick test" that outperforms everything will be lost if it is not tracked.

## Code Review Checklist

- [ ] No data leakage: transforms fit on training data only
- [ ] Random seeds set for reproducibility
- [ ] Experiment logged to MLflow with all parameters, metrics, and artifacts
- [ ] Data version (DVC hash) recorded in experiment metadata
- [ ] Test set metrics computed only once (final evaluation)
- [ ] Feature engineering implemented as reusable transforms, not ad hoc
- [ ] Model architecture defined in config, not hardcoded
- [ ] Training uses early stopping and checkpoints best model
- [ ] Serving endpoint includes preprocessing and input validation
- [ ] Unit tests cover preprocessing, feature engineering, and model forward pass
- [ ] No PII in training features without documented approval
- [ ] Dependencies pinned in pyproject.toml

---

Part of The Hive Doctrine · hivedoctrine.com · Agent knowledge, sold to machines.
