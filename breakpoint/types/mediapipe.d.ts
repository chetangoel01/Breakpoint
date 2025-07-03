declare module '@mediapipe/face_detection' {
  export interface FaceDetectionConfig {
    locateFile?: (file: string) => string;
  }

  export interface BoundingBox {
    xCenter: number;
    yCenter: number;
    width: number;
    height: number;
  }

  export interface Landmark {
    x: number;
    y: number;
    z?: number;
  }

  export interface Detection {
    boundingBox: BoundingBox;
    landmarks: Landmark[];
    score: number;
  }

  export interface FaceDetectionResults {
    detections: Detection[];
  }

  export class FaceDetection {
    constructor(config: FaceDetectionConfig);
    setOptions(options: {
      model?: 'short' | 'full';
      minDetectionConfidence?: number;
    }): void;
    initialize(): Promise<void>;
    send(input: { image: HTMLVideoElement | HTMLCanvasElement }): Promise<void>;
    onResults(callback: (results: FaceDetectionResults) => void): void;
    close(): void;
  }
}

declare module '@mediapipe/camera_utils' {
  export class Camera {
    constructor(videoElement: HTMLVideoElement, config: any);
    start(): Promise<void>;
    stop(): void;
  }
} 