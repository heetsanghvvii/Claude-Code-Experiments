#!/usr/bin/env python3
"""AI video enhancement: upscaling, frame interpolation, face restoration, background removal.

Subcommands:
  upscale        AI upscaling with Real-ESRGAN (2x/4x, 720p→4K)
  interpolate    Frame interpolation with Practical-RIFE (smooth slow motion)
  restore-faces  Face restoration with CodeFormer (old/low-quality footage)
  remove-bg      Background removal with rembg (transparent video)
  pipeline       Combined enhancement pipeline

Usage:
  python3 video_enhance.py upscale INPUT --scale 4 [--half] --output FILE
  python3 video_enhance.py interpolate INPUT --multi 2 --output FILE
  python3 video_enhance.py restore-faces INPUT --fidelity 0.7 --output FILE
  python3 video_enhance.py remove-bg INPUT [--format webm|prores] --output FILE
  python3 video_enhance.py pipeline INPUT [--upscale 2] [--restore-faces 0.7] [--interpolate 2] --output FILE
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path


def get_free_vram_mb():
    """Get free VRAM in MB."""
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.free", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=5
        )
        return int(result.stdout.strip().split('\n')[0])
    except Exception:
        return 0


def ensure_vram(required_mb):
    """Ensure enough VRAM is available."""
    try:
        import torch
        import gc
        torch.cuda.empty_cache()
        gc.collect()
        torch.cuda.empty_cache()
    except ImportError:
        pass
    free = get_free_vram_mb()
    if free < required_mb:
        print(json.dumps({
            "error": f"Insufficient VRAM: {free}MB free, {required_mb}MB required",
            "suggestion": "Close other GPU applications"
        }))
        return False
    return True


def get_video_info(video_path):
    """Get video resolution, FPS, and frame count."""
    result = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json",
         "-show_streams", "-show_format", "-select_streams", "v:0", video_path],
        capture_output=True, text=True
    )
    data = json.loads(result.stdout)
    stream = data["streams"][0]
    fmt = data.get("format", {})

    width = int(stream["width"])
    height = int(stream["height"])

    fps_str = stream.get("r_frame_rate", "30/1")
    num, den = fps_str.split("/")
    fps = float(num) / float(den)

    # Frame count
    frames = int(stream.get("nb_frames", 0))
    if frames == 0:
        duration = float(fmt.get("duration", 0))
        frames = int(duration * fps)

    duration = float(fmt.get("duration", 0))

    return {
        "width": width, "height": height, "fps": fps,
        "frames": frames, "duration": duration
    }


def extract_frames(video_path, output_dir):
    """Extract all frames as PNG."""
    os.makedirs(output_dir, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-i", video_path, "-qscale:v", "1", "-qmin", "1",
         os.path.join(output_dir, "frame_%08d.png")],
        capture_output=True, check=True
    )
    return sorted(Path(output_dir).glob("frame_*.png"))


def extract_audio(video_path, output_path):
    """Extract audio track."""
    result = subprocess.run(
        ["ffmpeg", "-y", "-i", video_path, "-vn", "-c:a", "copy", output_path],
        capture_output=True
    )
    return result.returncode == 0 and os.path.exists(output_path)


def reassemble_video(frames_dir, audio_path, fps, output_path, codec="libx264",
                     pix_fmt="yuv420p", crf=18):
    """Reassemble frames + audio into video."""
    frame_pattern = os.path.join(frames_dir, "frame_%08d.png")

    # Check if we have _out suffix from Real-ESRGAN
    if not list(Path(frames_dir).glob("frame_*.png")):
        frame_pattern = os.path.join(frames_dir, "frame_%08d_out.png")

    cmd = ["ffmpeg", "-y", "-framerate", str(fps),
           "-i", frame_pattern]

    if audio_path and os.path.exists(audio_path):
        cmd.extend(["-i", audio_path, "-c:a", "aac", "-b:a", "192k"])

    cmd.extend([
        "-c:v", codec, "-crf", str(crf), "-preset", "fast",
        "-pix_fmt", pix_fmt, "-movflags", "+faststart"
    ])

    if audio_path and os.path.exists(audio_path):
        cmd.extend(["-map", "0:v:0", "-map", "1:a:0", "-shortest"])

    cmd.append(output_path)
    subprocess.run(cmd, capture_output=True, check=True)


def upscale(args):
    """Upscale video with Real-ESRGAN."""
    input_path = args.input
    scale = args.scale
    use_half = args.half
    output_path = args.output
    model = args.model

    info = get_video_info(input_path)
    total_frames = info["frames"]
    new_w = info["width"] * scale
    new_h = info["height"] * scale

    # Estimate time
    fps_estimate = 3.5 if use_half else 2.0
    est_time = total_frames / fps_estimate
    est_space_gb = total_frames * new_w * new_h * 3 / 1024**3 * 1.5

    print(json.dumps({
        "estimate": True,
        "frames": total_frames,
        "input_resolution": f"{info['width']}x{info['height']}",
        "output_resolution": f"{new_w}x{new_h}",
        "estimated_time_sec": round(est_time),
        "estimated_time_human": f"{est_time/3600:.1f}h" if est_time > 3600 else f"{est_time/60:.1f}m",
        "estimated_temp_space_gb": round(est_space_gb, 1)
    }, indent=2))

    if not ensure_vram(4000 if use_half else 6000):
        sys.exit(1)

    start = time.time()
    tmpdir = tempfile.mkdtemp(prefix="video_enhance_")

    try:
        frames_dir = os.path.join(tmpdir, "frames")
        upscaled_dir = os.path.join(tmpdir, "upscaled")
        audio_path = os.path.join(tmpdir, "audio.aac")

        # Extract frames
        print("  Extracting frames...", file=sys.stderr, flush=True)
        extract_frames(input_path, frames_dir)

        # Extract audio
        has_audio = extract_audio(input_path, audio_path)

        # Upscale with Real-ESRGAN
        print("  Upscaling frames with Real-ESRGAN...", file=sys.stderr, flush=True)
        os.makedirs(upscaled_dir, exist_ok=True)

        cmd = ["python3", "-m", "realesrgan", "-n", model,
               "-i", frames_dir, "-o", upscaled_dir,
               "--outscale", str(scale)]
        if use_half:
            cmd.append("--half")

        subprocess.run(cmd, check=True)

        # Reassemble
        print("  Reassembling video...", file=sys.stderr, flush=True)
        reassemble_video(upscaled_dir, audio_path if has_audio else None,
                         info["fps"], output_path)

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    elapsed = time.time() - start

    print(json.dumps({
        "action": "upscale",
        "model": model,
        "scale": scale,
        "input": input_path,
        "output": output_path,
        "input_resolution": f"{info['width']}x{info['height']}",
        "output_resolution": f"{new_w}x{new_h}",
        "total_frames": total_frames,
        "processing_fps": round(total_frames / elapsed, 1),
        "processing_time_sec": round(elapsed, 1),
        "half_precision": use_half,
        "file_size_mb": round(os.path.getsize(output_path) / 1024 / 1024, 2)
    }, indent=2))


def interpolate(args):
    """Frame interpolation with Practical-RIFE."""
    input_path = args.input
    multi = args.multi
    output_path = args.output

    rife_dir = os.path.expanduser("~/.video-skill/rife")
    if not os.path.exists(rife_dir):
        print(json.dumps({
            "error": "Practical-RIFE not found",
            "suggestion": f"git clone https://github.com/hzwer/Practical-RIFE.git {rife_dir}"
        }))
        sys.exit(1)

    if not ensure_vram(4000):
        sys.exit(1)

    info = get_video_info(input_path)
    start = time.time()

    # Run RIFE
    subprocess.run(
        ["python3", os.path.join(rife_dir, "inference_video.py"),
         f"--multi={multi}", f"--video={input_path}"],
        check=True, cwd=rife_dir
    )

    # RIFE outputs to same directory as input
    rife_output = input_path.rsplit(".", 1)[0] + f"_{multi}X.mp4"
    if os.path.exists(rife_output):
        os.rename(rife_output, output_path)

    elapsed = time.time() - start
    new_fps = info["fps"] * multi

    print(json.dumps({
        "action": "interpolate",
        "model": "Practical-RIFE-v4",
        "multi": multi,
        "input": input_path,
        "output": output_path,
        "input_fps": info["fps"],
        "output_fps": new_fps,
        "processing_time_sec": round(elapsed, 1),
        "file_size_mb": round(os.path.getsize(output_path) / 1024 / 1024, 2) if os.path.exists(output_path) else None
    }, indent=2))


def restore_faces(args):
    """Face restoration with CodeFormer."""
    input_path = args.input
    fidelity = args.fidelity
    bg_upscale = args.bg_upscale
    output_path = args.output

    codeformer_dir = os.path.expanduser("~/.video-skill/codeformer")
    if not os.path.exists(codeformer_dir):
        print(json.dumps({
            "error": "CodeFormer not found",
            "suggestion": f"git clone https://github.com/sczhou/CodeFormer.git {codeformer_dir} && "
                          f"cd {codeformer_dir} && pip install -r requirements.txt"
        }))
        sys.exit(1)

    if not ensure_vram(4000 if not bg_upscale else 8000):
        sys.exit(1)

    info = get_video_info(input_path)
    start = time.time()
    tmpdir = tempfile.mkdtemp(prefix="video_enhance_faces_")

    try:
        frames_dir = os.path.join(tmpdir, "frames")
        restored_dir = os.path.join(tmpdir, "restored")
        audio_path = os.path.join(tmpdir, "audio.aac")

        print("  Extracting frames...", file=sys.stderr, flush=True)
        extract_frames(input_path, frames_dir)
        has_audio = extract_audio(input_path, audio_path)

        print("  Restoring faces with CodeFormer...", file=sys.stderr, flush=True)
        cmd = ["python3", os.path.join(codeformer_dir, "inference_codeformer.py"),
               "-w", str(fidelity),
               "--input_path", frames_dir,
               "--output_path", restored_dir]

        if bg_upscale:
            cmd.append("--bg_upsampler")
            cmd.append("realesrgan")
            cmd.append("--face_upsample")

        subprocess.run(cmd, check=True, cwd=codeformer_dir)

        # Find the restored frames (CodeFormer outputs to a subfolder)
        final_dir = os.path.join(restored_dir, "final_results")
        if not os.path.isdir(final_dir):
            final_dir = restored_dir

        print("  Reassembling video...", file=sys.stderr, flush=True)
        reassemble_video(final_dir, audio_path if has_audio else None,
                         info["fps"], output_path)

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    elapsed = time.time() - start

    print(json.dumps({
        "action": "restore_faces",
        "model": "CodeFormer",
        "fidelity": fidelity,
        "bg_upscale": bg_upscale,
        "input": input_path,
        "output": output_path,
        "total_frames": info["frames"],
        "processing_time_sec": round(elapsed, 1),
        "file_size_mb": round(os.path.getsize(output_path) / 1024 / 1024, 2)
    }, indent=2))


def remove_bg(args):
    """Remove background from video with rembg."""
    input_path = args.input
    fmt = args.format
    model = args.model
    output_path = args.output

    if not ensure_vram(2000):
        # Try CPU fallback
        print("  Insufficient VRAM, using CPU mode", file=sys.stderr)

    info = get_video_info(input_path)
    start = time.time()
    tmpdir = tempfile.mkdtemp(prefix="video_enhance_bg_")

    try:
        frames_dir = os.path.join(tmpdir, "frames")
        nobg_dir = os.path.join(tmpdir, "nobg")
        audio_path = os.path.join(tmpdir, "audio.aac")

        print("  Extracting frames...", file=sys.stderr, flush=True)
        extract_frames(input_path, frames_dir)
        has_audio = extract_audio(input_path, audio_path)

        # Remove backgrounds with rembg batch mode
        print("  Removing backgrounds with rembg...", file=sys.stderr, flush=True)
        os.makedirs(nobg_dir, exist_ok=True)
        subprocess.run(
            ["rembg", "p", "-m", model, frames_dir, nobg_dir],
            check=True
        )

        # Reassemble with alpha channel
        print("  Reassembling transparent video...", file=sys.stderr, flush=True)
        frame_pattern = os.path.join(nobg_dir, "frame_%08d.png")

        if fmt == "prores":
            codec_args = ["-c:v", "prores_ks", "-profile:v", "4",
                          "-pix_fmt", "yuva444p10le"]
        else:  # webm
            codec_args = ["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
                          "-crf", "20", "-b:v", "0"]

        cmd = ["ffmpeg", "-y", "-framerate", str(info["fps"]),
               "-i", frame_pattern]

        if has_audio and os.path.exists(audio_path):
            cmd.extend(["-i", audio_path])

        cmd.extend(codec_args)

        if has_audio and os.path.exists(audio_path):
            if fmt == "webm":
                cmd.extend(["-c:a", "libopus", "-b:a", "128k"])
            else:
                cmd.extend(["-c:a", "aac", "-b:a", "192k"])
            cmd.extend(["-map", "0:v:0", "-map", "1:a:0", "-shortest"])

        cmd.append(output_path)
        subprocess.run(cmd, capture_output=True, check=True)

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    elapsed = time.time() - start

    print(json.dumps({
        "action": "remove_background",
        "model": model,
        "format": fmt,
        "input": input_path,
        "output": output_path,
        "total_frames": info["frames"],
        "processing_time_sec": round(elapsed, 1),
        "file_size_mb": round(os.path.getsize(output_path) / 1024 / 1024, 2)
    }, indent=2))


def pipeline(args):
    """Combined enhancement pipeline."""
    input_path = args.input
    output_path = args.output
    current = input_path
    steps_done = []

    tmpdir = tempfile.mkdtemp(prefix="video_enhance_pipeline_")

    try:
        if args.upscale:
            print("  [Pipeline] Upscaling...", file=sys.stderr, flush=True)
            step_output = os.path.join(tmpdir, "step_upscale.mp4")
            upscale_args = argparse.Namespace(
                input=current, scale=args.upscale, half=True,
                model="RealESRGAN_x4plus", output=step_output
            )
            upscale(upscale_args)
            current = step_output
            steps_done.append(f"upscale_{args.upscale}x")

        if args.restore_faces is not None:
            print("  [Pipeline] Restoring faces...", file=sys.stderr, flush=True)
            step_output = os.path.join(tmpdir, "step_faces.mp4")
            face_args = argparse.Namespace(
                input=current, fidelity=args.restore_faces,
                bg_upscale=False, output=step_output
            )
            restore_faces(face_args)
            current = step_output
            steps_done.append(f"faces_w{args.restore_faces}")

        if args.interpolate:
            print("  [Pipeline] Interpolating...", file=sys.stderr, flush=True)
            step_output = os.path.join(tmpdir, "step_interp.mp4")
            interp_args = argparse.Namespace(
                input=current, multi=args.interpolate, output=step_output
            )
            interpolate(interp_args)
            current = step_output
            steps_done.append(f"interp_{args.interpolate}x")

        # Copy final result
        if current != output_path:
            shutil.copy2(current, output_path)

    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)

    print(json.dumps({
        "action": "pipeline",
        "steps": steps_done,
        "input": input_path,
        "output": output_path,
        "file_size_mb": round(os.path.getsize(output_path) / 1024 / 1024, 2)
    }, indent=2))


def main():
    parser = argparse.ArgumentParser(description="AI video enhancement")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Upscale
    up = subparsers.add_parser("upscale", help="AI upscaling with Real-ESRGAN")
    up.add_argument("input", help="Input video file")
    up.add_argument("--scale", type=int, default=4, choices=[2, 4], help="Scale factor (default: 4)")
    up.add_argument("--half", action="store_true", default=True, help="Use FP16 (default: true)")
    up.add_argument("--model", default="RealESRGAN_x4plus", help="Model name")
    up.add_argument("--output", required=True, help="Output file path")

    # Interpolate
    interp = subparsers.add_parser("interpolate", help="Frame interpolation with RIFE")
    interp.add_argument("input", help="Input video file")
    interp.add_argument("--multi", type=int, default=2, choices=[2, 4, 8], help="Frame multiplier")
    interp.add_argument("--output", required=True, help="Output file path")

    # Restore faces
    face = subparsers.add_parser("restore-faces", help="Face restoration with CodeFormer")
    face.add_argument("input", help="Input video file")
    face.add_argument("--fidelity", type=float, default=0.7, help="Fidelity 0.0-1.0 (default: 0.7)")
    face.add_argument("--bg-upscale", action="store_true", help="Upscale background too")
    face.add_argument("--output", required=True, help="Output file path")

    # Remove BG
    bg = subparsers.add_parser("remove-bg", help="Background removal with rembg")
    bg.add_argument("input", help="Input video file")
    bg.add_argument("--format", default="webm", choices=["webm", "prores"],
                    help="Output format (default: webm)")
    bg.add_argument("--model", default="u2net_human_seg", help="rembg model")
    bg.add_argument("--output", required=True, help="Output file path")

    # Pipeline
    pipe = subparsers.add_parser("pipeline", help="Combined enhancement pipeline")
    pipe.add_argument("input", help="Input video file")
    pipe.add_argument("--upscale", type=int, choices=[2, 4], help="Upscale factor")
    pipe.add_argument("--restore-faces", type=float, help="Face restoration fidelity")
    pipe.add_argument("--interpolate", type=int, choices=[2, 4, 8], help="Frame interpolation")
    pipe.add_argument("--output", required=True, help="Output file path")

    args = parser.parse_args()

    if args.command == "upscale":
        upscale(args)
    elif args.command == "interpolate":
        interpolate(args)
    elif args.command == "restore-faces":
        restore_faces(args)
    elif args.command == "remove-bg":
        remove_bg(args)
    elif args.command == "pipeline":
        pipeline(args)


if __name__ == "__main__":
    main()
