#!/usr/bin/env python3
"""Face-tracking smart crop for vertical video conversion.

Uses MediaPipe BlazeFace to detect faces and smoothly crop to 9:16 aspect ratio,
keeping the primary speaker centered. Falls back to center-crop when no face detected.

Usage:
  python3 face_tracker.py INPUT OUTPUT [--aspect 9:16] [--smoothing 0.1]
      [--output-width 1080] [--output-height 1920]
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile
import time


def get_video_info(video_path):
    """Get video resolution and FPS via ffprobe."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json",
         "-show_streams", "-select_streams", "v:0", video_path],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    stream = data["streams"][0]
    width = int(stream["width"])
    height = int(stream["height"])

    # Parse FPS
    fps_str = stream.get("r_frame_rate", "30/1")
    num, den = fps_str.split("/")
    fps = float(num) / float(den)

    return width, height, fps


def process_video(input_path, output_path, target_aspect=(9, 16),
                  smoothing=0.1, output_width=1080, output_height=1920):
    """Process video with face-tracked cropping."""
    import cv2
    import mediapipe as mp
    import numpy as np

    mp_face = mp.solutions.face_detection

    width, height, fps = get_video_info(input_path)

    # Calculate crop dimensions from source
    aspect_w, aspect_h = target_aspect
    target_ratio = aspect_w / aspect_h  # 9/16 = 0.5625

    # Crop width from source resolution (maintaining height)
    crop_w = int(height * target_ratio)
    if crop_w > width:
        # Source is already narrower than target — crop height instead
        crop_w = width
        crop_h = int(width / target_ratio)
    else:
        crop_h = height

    # Open video
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(json.dumps({"error": f"Cannot open video: {input_path}"}))
        sys.exit(1)

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    # Temp output for video (no audio)
    tmp_fd = tempfile.NamedTemporaryFile(suffix=".mp4", delete=False)
    tmp_video = tmp_fd.name
    tmp_fd.close()

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(tmp_video, fourcc, fps, (output_width, output_height))

    smooth_x = width // 2  # Start centered
    smooth_y = height // 2
    faces_detected = 0
    frame_count = 0

    start_time = time.time()

    with mp_face.FaceDetection(model_selection=1, min_detection_confidence=0.5) as fd:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Detect faces
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = fd.process(rgb)

            if results.detections:
                faces_detected += 1
                # Use the most confident detection
                det = max(results.detections, key=lambda d: d.score[0])
                bbox = det.location_data.relative_bounding_box

                # Face center in absolute coordinates
                face_cx = int((bbox.xmin + bbox.width / 2) * width)
                face_cy = int((bbox.ymin + bbox.height / 2) * height)

                # Exponential smoothing
                smooth_x = int(smoothing * face_cx + (1 - smoothing) * smooth_x)
                smooth_y = int(smoothing * face_cy + (1 - smoothing) * smooth_y)

            # Calculate crop window (centered on smooth position)
            x1 = max(0, min(smooth_x - crop_w // 2, width - crop_w))
            y1 = max(0, min(smooth_y - crop_h // 2, height - crop_h))

            # Crop and resize
            cropped = frame[y1:y1 + crop_h, x1:x1 + crop_w]
            resized = cv2.resize(cropped, (output_width, output_height),
                                 interpolation=cv2.INTER_LANCZOS4)

            writer.write(resized)

            # Progress every 10%
            if frame_count % max(1, total_frames // 10) == 0:
                pct = int(frame_count / total_frames * 100)
                print(f"  Cropping: {pct}% ({frame_count}/{total_frames} frames)",
                      file=sys.stderr, flush=True)

    cap.release()
    writer.release()

    # Mux audio from original
    subprocess.run(
        ["ffmpeg", "-y", "-i", tmp_video, "-i", input_path,
         "-c:v", "libx264", "-crf", "18", "-preset", "fast",
         "-c:a", "aac", "-b:a", "192k",
         "-map", "0:v:0", "-map", "1:a:0?",
         "-movflags", "+faststart", "-shortest",
         output_path],
        capture_output=True, check=True
    )

    # Clean up temp file
    os.unlink(tmp_video)

    elapsed = time.time() - start_time
    detection_rate = faces_detected / frame_count if frame_count > 0 else 0

    result = {
        "action": "face_track_crop",
        "input": input_path,
        "output": output_path,
        "input_resolution": f"{width}x{height}",
        "output_resolution": f"{output_width}x{output_height}",
        "aspect_ratio": f"{target_aspect[0]}:{target_aspect[1]}",
        "total_frames": frame_count,
        "faces_detected_frames": faces_detected,
        "face_detection_rate": round(detection_rate, 3),
        "smoothing_alpha": smoothing,
        "processing_time_sec": round(elapsed, 1),
        "processing_fps": round(frame_count / elapsed, 1) if elapsed > 0 else 0
    }

    print(json.dumps(result, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Face-tracking smart crop for vertical video")
    parser.add_argument("input", help="Input video file")
    parser.add_argument("output", help="Output cropped video file")
    parser.add_argument("--aspect", default="9:16",
                        help="Target aspect ratio (default: 9:16)")
    parser.add_argument("--smoothing", type=float, default=0.1,
                        help="Smoothing factor 0-1 (lower=smoother, default: 0.1)")
    parser.add_argument("--output-width", type=int, default=1080,
                        help="Output width in pixels (default: 1080)")
    parser.add_argument("--output-height", type=int, default=1920,
                        help="Output height in pixels (default: 1920)")

    args = parser.parse_args()

    # Parse aspect ratio
    parts = args.aspect.split(":")
    aspect = (int(parts[0]), int(parts[1]))

    process_video(args.input, args.output, aspect,
                  args.smoothing, args.output_width, args.output_height)


if __name__ == "__main__":
    main()
