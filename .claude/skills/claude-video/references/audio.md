# Audio Processing Reference

## Loudness Targets by Platform

| Platform | Target LUFS | True Peak | LRA |
|----------|------------|-----------|-----|
| YouTube | -14 LUFS | -1.0 dBTP | 7-15 |
| Spotify | -14 LUFS | -1.0 dBTP | 7-15 |
| Apple Music | -16 LUFS | -1.0 dBTP | - |
| Podcast | -16 LUFS | -1.5 dBTP | - |
| Broadcast (EBU R128) | -23 LUFS | -1.0 dBTP | - |
| TikTok/Reels | -14 LUFS | -1.0 dBTP | - |

## Two-Pass Loudness Normalization

```
# Pass 1: Measure
ffmpeg -i input -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -

# Pass 2: Apply (use measured values from pass 1)
ffmpeg -n -i input -af "loudnorm=I=-14:TP=-1.5:LRA=11:\
measured_I=VALUE:measured_TP=VALUE:measured_LRA=VALUE:\
measured_thresh=VALUE:offset=VALUE:linear=true" -c:v copy output
```

## Audio Codecs

| Codec | Encoder | Bitrate | Use Case |
|-------|---------|---------|----------|
| AAC | aac | 128-256k | Video, streaming, universal |
| MP3 | libmp3lame | 192-320k | Universal playback |
| Opus | libopus | 96-160k | Best efficiency, WebM |
| FLAC | flac | Lossless | Archival, editing |
| WAV | pcm_s16le | Uncompressed | Editing, processing |
| AC3 | ac3 | 384-640k | Surround sound |

## Noise Reduction

| Method | Filter | Quality | Speed |
|--------|--------|---------|-------|
| FFT-based | `afftdn=nf=-25:nt=w` | Good | Fast |
| Non-local means | `anlmdn=s=7:p=0.002:r=0.002` | Best | Slow |
| Highpass/lowpass | `highpass=f=80,lowpass=f=12000` | Basic | Fast |

## Common Audio Filters

| Filter | Syntax | Purpose |
|--------|--------|---------|
| Volume | `volume=1.5` or `volume=-6dB` | Adjust level |
| Bass boost | `bass=g=5:f=100:w=0.5` | Low-end enhancement |
| Treble boost | `treble=g=3:f=4000:w=0.5` | High-end enhancement |
| Equalizer | `equalizer=f=FREQ:t=q:w=WIDTH:g=GAIN` | Parametric EQ |
| Compressor | `acompressor=threshold=-20dB:ratio=4:attack=5:release=50` | Dynamic range |
| Limiter | `alimiter=limit=0.95:level=false` | Prevent clipping |
| Fade in | `afade=t=in:st=0:d=2` | Audio fade |
| Fade out | `afade=t=out:st=OFFSET:d=2` | Audio fade |
| Silence detect | `silencedetect=noise=-30dB:d=0.5` | Find quiet parts |
| Silence remove | `silenceremove=start_periods=1:start_silence=0.5:start_threshold=-30dB` | Cut silence |

## Channel Operations

| Operation | Flags |
|-----------|-------|
| Stereo to mono | `-ac 1` |
| Mono to stereo | `-ac 2` |
| Extract left | `-af "pan=mono\|c0=FL"` |
| Extract right | `-af "pan=mono\|c0=FR"` |
| Swap channels | `-af "pan=stereo\|c0=c1\|c1=c0"` |

## Audio Sync Fix

- Delay audio: `-itsoffset 0.5 -i input` (on second input, map accordingly)
- Use `-async 1` for automatic drift correction (may cause artifacts)
