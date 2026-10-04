# Captions and Subtitles Reference

## Whisper Model Selection

| Model | Size | VRAM | Speed vs Realtime | Accuracy | Recommended For |
|-------|------|------|-------------------|----------|-----------------|
| tiny | 75M | ~1 GB | 32x | Low | Quick drafts |
| base | 142M | ~1 GB | 16x | Fair | Fast subtitles |
| small | 466M | ~2 GB | 6x | Good | General use |
| medium | 1.5B | ~5 GB | 2x | Very good | Quality captioning |
| large-v3-turbo | 809M | ~6 GB | 8x | Very good | Best speed/accuracy ratio |
| large-v3 | 1.5B | ~10 GB | 1x | Best | Professional delivery |

**Default**: `large-v3-turbo` (best balance of speed and accuracy)

## Whisper CLI (faster-whisper)

```
whisper-ctranslate2 audio.wav \
  --model large-v3-turbo \
  --output_format json \
  --word_timestamps True \
  --vad_filter True \
  --compute_type float16 \
  --language auto \
  --output_dir /tmp/
```

`--compute_type`: float16 (GPU), int8 (CPU, fast), float32 (CPU, accurate)
`--vad_filter`: Removes non-speech segments before transcription
`--word_timestamps`: Required for karaoke-style captions

## Subtitle Formats

| Format | Extension | Features | Use Case |
|--------|-----------|----------|----------|
| SRT | .srt | Basic timing + text | Universal, simple |
| ASS | .ass | Full styling, animations, karaoke | Animated captions |
| WebVTT | .vtt | HTML-compatible, basic styling | Web players |
| PGS | .sup | Bitmap subtitles (Blu-ray) | Extraction only |

## ASS Karaoke Tags

| Tag | Effect |
|-----|--------|
| `\kf{cs}` | Smooth fill highlight (centiseconds) — recommended |
| `\K{cs}` | Instant fill highlight |
| `\ko{cs}` | Outline highlight |
| `\fad(in,out)` | Fade in/out in milliseconds |
| `\fscx{%}\fscy{%}` | Scale X/Y — use for "pop" effect |
| `\fn{Font}` | Font name |
| `\fs{px}` | Font size |
| `\c&HBBGGRR&` | Primary color (BGR, NOT RGB) |
| `\3c&HBBGGRR&` | Outline color |
| `\bord{px}` | Outline width |
| `\shad{px}` | Shadow depth |
| `\an{1-9}` | Alignment (numpad layout: 2=bottom-center) |
| `\pos(x,y)` | Absolute position |

## ASS Color Format

ASS uses `&HAABBGGRR` (Alpha-Blue-Green-Red), NOT RGB:
- White: `&H00FFFFFF`
- Black: `&H00000000`
- Red: `&H000000FF`
- Yellow: `&H0000FFFF`
- Semi-transparent black: `&H80000000`

## Caption Style Presets

**TikTok/Reels** (large, centered, impact):
```
FontName=Impact,FontSize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=3,Shadow=0,Alignment=2,MarginV=300
```

**YouTube** (clean, bottom):
```
FontName=Arial,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,Alignment=2,MarginV=40
```

**Podcast/Interview** (minimal, lower third):
```
FontName=Helvetica,FontSize=16,PrimaryColour=&H00FFFFFF,BackColour=&H80000000,BorderStyle=4,Alignment=2,MarginV=20
```

## Burn-In Commands

```
# ASS (styled, animated)
ffmpeg -n -i video.mp4 -vf "ass=captions.ass" -c:a copy output.mp4

# SRT (with force_style)
ffmpeg -n -i video.mp4 -vf "subtitles=subs.srt:force_style='FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2'" -c:a copy output.mp4
```

## Extract and Convert

```
# Extract from video
ffmpeg -n -i input.mkv -map 0:s:0 subs.srt

# SRT → ASS
ffmpeg -n -i input.srt output.ass

# ASS → SRT
ffmpeg -n -i input.ass output.srt
```

## 99 Languages Supported

Whisper supports: Afrikaans, Albanian, Amharic, Arabic, Armenian, Azerbaijani, Basque, Belarusian, Bengali, Bosnian, Bulgarian, Burmese, Catalan, Chinese, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, Galician, Georgian, German, Greek, Gujarati, Haitian Creole, Hausa, Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Italian, Japanese, Javanese, Kannada, Kazakh, Khmer, Korean, Lao, Latin, Latvian, Lithuanian, Luxembourgish, Macedonian, Malagasy, Malay, Malayalam, Maltese, Maori, Marathi, Mongolian, Nepali, Norwegian, Pashto, Persian, Polish, Portuguese, Punjabi, Romanian, Russian, Serbian, Shona, Sindhi, Sinhala, Slovak, Slovenian, Somali, Spanish, Sundanese, Swahili, Swedish, Tagalog, Tajik, Tamil, Tatar, Telugu, Thai, Tibetan, Turkish, Turkmen, Ukrainian, Urdu, Uzbek, Vietnamese, Welsh, Yiddish, Yoruba.
