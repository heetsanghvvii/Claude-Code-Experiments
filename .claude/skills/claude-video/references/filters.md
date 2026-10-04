# Video Filters Reference

## Geometry and Transform

| Filter | Syntax | Example |
|--------|--------|---------|
| Scale | `scale=W:H:flags=lanczos` | `scale=1280:-2:flags=lanczos` (-2 = even height) |
| Crop | `crop=W:H:X:Y` | `crop=640:480:100:50` |
| Pad | `pad=W:H:X:Y:color` | `pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black` |
| Rotate 90° CW | `transpose=1` | |
| Rotate 90° CCW | `transpose=2` | |
| Rotate arbitrary | `rotate=ANGLE:fillcolor=color` | `rotate=PI/6:fillcolor=black` |
| Flip horizontal | `hflip` | |
| Flip vertical | `vflip` | |
| Fit to size | `scale=W:H:force_original_aspect_ratio=decrease` | Keeps aspect ratio |

## Color Correction

| Filter | Syntax | Use Case |
|--------|--------|----------|
| Brightness/Contrast | `eq=brightness=0.06:contrast=1.2:saturation=1.3:gamma=1.0` | Quick adjustments |
| Tone curves | `curves=preset=lighter` | Presets: lighter, darker, increase_contrast, vintage, etc. |
| Color balance | `colorbalance=rs=0.3:gs=-0.1:bs=0.0:ms=0:mh=0` | Per-channel shadow/mid/highlight |
| 3D LUT | `lut3d=file=my_lut.cube` | Industry-standard color grading |
| Channel mixer | `colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3` | Grayscale conversion |
| Levels | `curves=m='0/0 0.25/0.15 0.5/0.5 0.75/0.85 1/1'` | Custom S-curve |

## Text Overlay (drawtext)

```
drawtext=text='Text':fontsize=36:fontcolor=white:x=10:y=10:\
fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:\
box=1:boxcolor=black@0.5:boxborderw=5
```

| Parameter | Values |
|-----------|--------|
| `text` | Static text or `%{pts\:hms}` for timecode |
| `fontsize` | Pixel size |
| `fontcolor` | white, black, red, `0xRRGGBB`, `white@0.5` (alpha) |
| `x`, `y` | Position. Use `(w-tw)/2` for center, `W-tw-10` for right margin |
| `enable` | `'between(t,5,15)'` for timed display |
| `fontfile` | Path to .ttf file |
| `box=1:boxcolor` | Background box behind text |

## Blur, Sharpen, Denoise

| Filter | Syntax | Speed | Quality |
|--------|--------|-------|---------|
| Gaussian blur | `gblur=sigma=10` | Fast | Good |
| Box blur | `boxblur=5:5` | Fastest | Basic |
| Sharpen | `unsharp=5:5:1.0:5:5:0.0` | Fast | Good |
| Denoise (temporal+spatial) | `hqdn3d=4:3:6:4.5` | Fast | Good |
| Denoise (best quality) | `nlmeans=s=3.5:p=7:r=15` | Slow | Best |
| Denoise (adaptive temporal) | `atadenoise` | Medium | Good |

## Video Stabilization (vidstab)

Two-pass required:
```
Pass 1: -vf vidstabdetect=shakiness=5:accuracy=15:result=transforms.trf -f null -
Pass 2: -vf vidstabtransform=smoothing=10:input=transforms.trf,unsharp=5:5:0.8
```
`shakiness` 1-10 (source shakiness). `smoothing` higher = smoother camera.

## Transitions (xfade)

```
-filter_complex "xfade=transition=TYPE:duration=D:offset=O"
```

Types: fade, dissolve, wipeleft, wiperight, wipeup, wipedown, slideleft, slideright, circlecrop, rectcrop, distance, fadeblack, fadewhite, radial, smoothleft, smoothright, circleopen, circleclose, pixelize, squeezeh, squeezev, zoomin, and 20+ more.

## Chromakey (Green Screen)

```
[0:v]chromakey=COLOR:SIMILARITY:BLEND[fg];[1:v][fg]overlay
```
- COLOR: `0x00FF00` (green), `0x0000FF` (blue)
- SIMILARITY: 0.01-1.0 (lower = stricter match)
- BLEND: 0.0-1.0 (edge softness)

## Fade

```
fade=t=in:st=0:d=2        # Video fade in, 2 seconds
fade=t=out:st=OFFSET:d=2   # Video fade out (get duration with ffprobe)
```

## HDR to SDR Tone Mapping

```
zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,\
tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p
```

## Frame Extraction

| Purpose | Command Fragment |
|---------|-----------------|
| Single frame | `-ss TIME -frames:v 1 -q:v 2 thumb.jpg` |
| Contact sheet | `-vf "select=not(mod(n\,100)),scale=320:180,tile=4x4" -frames:v 1 sheet.png` |
| Every N seconds | `-vf "fps=1/N" frame_%04d.jpg` |

## Chaining Filters

Multiple filters separated by commas in `-vf`:
```
-vf "scale=1280:-2,eq=brightness=0.05,unsharp=5:5:0.8"
```

Complex filtergraphs use `-filter_complex` with stream labels:
```
-filter_complex "[0:v]scale=1280:720[scaled];[scaled]drawtext=text='Hello'[out]" -map "[out]"
```
