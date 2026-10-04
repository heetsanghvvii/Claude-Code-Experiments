# Video Analysis Reference

## FFprobe Quick Commands

| Property | Command |
|----------|---------|
| Full dump (JSON) | `ffprobe -v error -print_format json -show_format -show_streams -show_chapters input` |
| Resolution | `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 input` |
| Duration (seconds) | `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 input` |
| Codec | `ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of default=nw=1:nk=1 input` |
| Framerate | `ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of default=nw=1:nk=1 input` |
| Bitrate | `ffprobe -v error -show_entries format=bit_rate -of default=nw=1:nk=1 input` |
| Pixel format | `ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of default=nw=1:nk=1 input` |
| Audio info | `ffprobe -v error -select_streams a -show_entries stream=codec_name,channels,sample_rate,bit_rate -of json input` |
| Chapters | `ffprobe -v error -print_format json -show_chapters input` |

## HDR Detection

```
ffprobe -v quiet -select_streams v:0 -show_entries stream=color_transfer,color_primaries,color_space -of default=nw=1 input
```

| color_transfer | Meaning |
|---------------|---------|
| smpte2084 | HDR10 / Dolby Vision |
| arib-std-b67 | HLG |
| bt709 | SDR |

## Keyframe Analysis

```
# List keyframe timestamps
ffprobe -v error -select_streams v:0 -skip_frame nokey -show_entries frame=pkt_pts_time -of csv=p=0 input

# Count keyframes
ffprobe -v error -select_streams v:0 -skip_frame nokey -show_entries frame=pkt_pts_time -of csv=p=0 input | wc -l

# I/P/B frame distribution
ffprobe -v error -select_streams v:0 -show_entries frame=pict_type -of csv=p=0 input | sort | uniq -c | sort -rn
```

## Scene Detection

**FFmpeg native** (fast):
```
ffmpeg -i input -vf "scdet=s=1:t=14" -f null - 2>&1 | grep "lavfi.scd.time"
```

**PySceneDetect** (professional):
```
scenedetect -i input detect-adaptive -t 3.0 list-scenes
scenedetect -i input detect-content -t 27.0 list-scenes
scenedetect -i input detect-adaptive -t 3.0 save-images split-video
```

Algorithms: adaptive (recommended), content, threshold, hash, hist.

## Quality Metrics

### VMAF (0-100, perceptual quality)

```
ffmpeg -i distorted -i reference \
  -lavfi "libvmaf=model=version=vmaf_v0.6.1:log_fmt=json:log_path=vmaf.json" -f null -
```

| Score | Quality |
|-------|---------|
| 93-100 | Excellent (transparent) |
| 80-93 | Good |
| 60-80 | Fair |
| <60 | Poor |

### SSIM + PSNR

```
ffmpeg -i distorted -i reference \
  -lavfi "libvmaf=feature=name=psnr:feature=name=float_ssim:log_fmt=json:log_path=results.json" -f null -
```

| Metric | Good | Excellent |
|--------|------|-----------|
| PSNR | >30 dB | >40 dB |
| SSIM | >0.95 | >0.98 |

### CRF Optimization Sweep

Encode at CRF 18,20,22,24,26,28,30, measure VMAF for each, find the quality-size sweet spot.

## Audio Loudness Measurement

```
ffmpeg -i input -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | tail -12
```

Returns: `input_i` (integrated LUFS), `input_tp` (true peak), `input_lra` (loudness range).

## Bitrate Analysis

```
# Average bitrate in Mbps
ffprobe -v error -show_entries format=bit_rate -of default=nw=1:nk=1 input | awk '{printf "%.1f Mbps\n", $1/1000000}'
```
