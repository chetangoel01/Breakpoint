# Breakpoint Project

This repository contains the complete Breakpoint project, an intelligent Pomodoro timer application with ML-powered fatigue detection.

## Project Structure

```
.
├── breakpoint/          # Main Electron + Next.js application
├── data/               # Training and augmented datasets
├── model/             # ML model and training scripts
└── ML_INTEGRATION_GUIDE.md  # Guide for ML integration
```

## Components

### 1. Breakpoint Application (`/breakpoint`)
The main desktop application built with:
- Next.js for the frontend
- Electron for desktop integration
- TailwindCSS for styling
- MediaPipe for real-time face detection

[View Breakpoint App Details](breakpoint/README.md)

### 2. ML Model (`/model`)
Machine learning model for drowsiness detection:
- Random Forest classifier
- Pre-trained model files
- Training notebook and prediction script
- Model evaluation metrics

Key files:
- `train_model.ipynb`: Training notebook with data preprocessing and model creation
- `predict.py`: Real-time prediction script used by the main application
- `rf_drowsiness_model.pkl`: Trained Random Forest model
- `rf_scaler.pkl`: Feature scaler
- `rf_label_encoder.pkl`: Label encoder

### 3. Dataset (`/data`)
Contains the drowsiness detection datasets:
- `drowsiness_dataset.csv`: Original dataset
- `drowsiness_augmented_dataset.csv`: Augmented training data
- `drowsiness_augmented_dataset_with_baseline.csv`: Dataset with baseline measurements

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/breakpoint.git
cd breakpoint
```

2. Follow the setup instructions in [breakpoint/README.md](breakpoint/README.md)

## Development Workflow

1. **ML Model Development**
   - Work with notebooks in `/model`
   - Use datasets from `/data`
   - Follow ML_INTEGRATION_GUIDE.md for integration

2. **Application Development**
   - Navigate to `/breakpoint`
   - Follow the development setup in breakpoint/README.md

## Distribution

The project can be distributed in two ways:

1. **Desktop Application**
   - Platform-specific installers (Windows, macOS, Linux)
   - Built using electron-builder
   
2. **Docker Container**
   - Development and testing environment
   - Includes all dependencies

See [breakpoint/README.md](breakpoint/README.md) for detailed distribution instructions.

## Contributing

Contributions are welcome! Please check the contributing guidelines in [breakpoint/README.md](breakpoint/README.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details. 