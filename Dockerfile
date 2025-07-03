FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    xvfb \
    libxcb1 \
    libxcb-icccm4 \
    libxcb-image0 \
    libxcb-keysyms1 \
    libxcb-randr0 \
    libxcb-render-util0 \
    libxcb-shape0 \
    libxcb-xfixes0 \
    libxcb-xinerama0 \
    libxkbcommon-x11-0 \
    libxcb-cursor0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY breakpoint/package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY breakpoint/ ./
COPY model/ ../model/

# Set up Python environment
RUN cd ../model && \
    python3 -m pip install --no-cache-dir -r requirements.txt

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application with virtual framebuffer for electron
CMD ["xvfb-run", "--auto-servernum", "npm", "start"] 