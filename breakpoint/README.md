# Breakpoint - Smart Focus Timer with Fatigue Detection

Breakpoint is an intelligent Pomodoro timer application that helps you maintain productivity while preventing fatigue. It uses computer vision to detect drowsiness and automatically suggests breaks when needed.

## Features

- 🕒 Customizable Pomodoro timer
- 👁️ Real-time fatigue detection using computer vision
- 🔄 Adaptive break suggestions based on drowsiness levels
- 🖥️ Mini-mode for distraction-free focus
- 📊 Session tracking and statistics
- 🌓 Dark/Light mode support
- 🎯 Customizable work/break durations
- 🤖 ML-powered drowsiness detection

## Prerequisites

- Node.js 18+ 
- Python 3.8+ (for ML model)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/breakpoint.git
cd breakpoint
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up the Python environment for the ML model:
```bash
cd model
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

This will start both the Next.js development server and the Electron application.

## Building for Distribution

### Prerequisites for Building

- Windows: No additional requirements
- macOS: Xcode Command Line Tools
- Linux: Required build tools (`build-essential`, etc.)

### Build Commands

1. Build the application:
```bash
npm run electron:dist
# or
yarn electron:dist
```

This will create distributable packages in the `dist` directory.

### Docker Container (Optional)

To containerize the application for development or testing:

1. Create a Dockerfile in the root directory:
```dockerfile
FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0

# Set working directory
WORKDIR /app

# Copy package files
COPY breakpoint/package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY breakpoint/ ./
COPY model/ ../model/

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

2. Build the Docker image:
```bash
docker build -t breakpoint .
```

3. Run the container:
```bash
docker run -p 3000:3000 breakpoint
```

Note: The Docker container is primarily for development and testing. For end-user distribution, use the electron-builder packages.

## Configuration

The application can be configured through the settings modal within the app. You can adjust:

- Work duration
- Short break duration
- Long break duration
- Long break interval
- Fatigue detection settings
  - Enable/disable
  - Sensitivity level
  - Auto-break threshold

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js for the web framework
- Electron for the desktop application framework
- MediaPipe for face detection
- TailwindCSS for styling
- All other open-source contributors
