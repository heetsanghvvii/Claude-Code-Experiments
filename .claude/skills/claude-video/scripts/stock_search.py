#!/usr/bin/env python3
"""Search Pixabay and Pexels for stock videos and music.

Usage:
    stock_search.py --query "aerial city" [options]

Options:
    --source pixabay|pexels     API source (default: pixabay)
    --media-type video|music    Media type (default: video, music=pixabay only)
    --orientation landscape|portrait|all  (default: landscape)
    --min-duration N            Minimum seconds (default: 5)
    --count N                   Max results (default: 5)
    --api-key KEY               Override env var
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
import urllib.parse


def search_pixabay_videos(query, api_key, orientation="landscape",
                          min_duration=5, count=5):
    """Search Pixabay video API."""
    params = urllib.parse.urlencode({
        "key": api_key,
        "q": query,
        "video_type": "film",
        "per_page": min(count * 3, 50),  # fetch extra to filter
        "safesearch": "true",
        "order": "popular",
    })
    url = f"https://pixabay.com/api/videos/?{params}"

    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())

    results = []
    for hit in data.get("hits", []):
        duration = hit.get("duration", 0)
        if duration < min_duration:
            continue

        # Pick best video file (large > medium > small)
        videos = hit.get("videos", {})
        for quality in ["large", "medium", "small"]:
            vf = videos.get(quality, {})
            if vf.get("url"):
                w, h = vf.get("width", 0), vf.get("height", 0)
                is_landscape = w >= h
                if orientation == "landscape" and not is_landscape:
                    continue
                if orientation == "portrait" and is_landscape:
                    continue

                results.append({
                    "id": hit["id"],
                    "source": "pixabay",
                    "query": query,
                    "duration": duration,
                    "width": w,
                    "height": h,
                    "quality": quality,
                    "download_url": vf["url"],
                    "preview_url": videos.get("tiny", {}).get("url", ""),
                    "page_url": hit.get("pageURL", ""),
                    "tags": hit.get("tags", ""),
                    "user": hit.get("user", ""),
                })
                break

        if len(results) >= count:
            break

    return results


def search_pixabay_music(query, api_key, count=5):
    """Search Pixabay music (audio) API."""
    params = urllib.parse.urlencode({
        "key": api_key,
        "q": query,
        "per_page": min(count * 2, 50),
        "safesearch": "true",
        "order": "popular",
        "media_type": "music",
    })
    # Pixabay music uses the same base endpoint with media_type param
    url = f"https://pixabay.com/api/?{params}"

    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())

    results = []
    for hit in data.get("hits", []):
        # Pixabay music: previewURL is the audio file URL
        # webformatURL is for images, not music — don't use as fallback
        audio_url = hit.get("previewURL", "")
        if not audio_url:
            continue

        results.append({
            "id": hit.get("id"),
            "source": "pixabay",
            "query": query,
            "duration": hit.get("duration", 0),
            "download_url": audio_url,
            "tags": hit.get("tags", ""),
            "user": hit.get("user", ""),
            "type": "music",
        })

        if len(results) >= count:
            break

    return results


def search_pexels_videos(query, api_key, orientation="landscape",
                         min_duration=5, count=5):
    """Search Pexels video API."""
    params = urllib.parse.urlencode({
        "query": query,
        "per_page": min(count * 3, 40),
        "orientation": orientation if orientation != "all" else "",
    })
    url = f"https://api.pexels.com/videos/search?{params}"

    req = urllib.request.Request(url, headers={"Authorization": api_key})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode())

    results = []
    for video in data.get("videos", []):
        duration = video.get("duration", 0)
        if duration < min_duration:
            continue

        # Pick best video file by resolution
        best = None
        for vf in video.get("video_files", []):
            w = vf.get("width", 0)
            h = vf.get("height", 0)
            if w >= 1920 and h >= 1080:
                best = vf
                break
            if best is None or w > best.get("width", 0):
                best = vf

        if best and best.get("link"):
            results.append({
                "id": video["id"],
                "source": "pexels",
                "query": query,
                "duration": duration,
                "width": best.get("width", 0),
                "height": best.get("height", 0),
                "quality": best.get("quality", ""),
                "download_url": best["link"],
                "preview_url": video.get("image", ""),
                "page_url": video.get("url", ""),
                "tags": "",
                "user": video.get("user", {}).get("name", ""),
            })

        if len(results) >= count:
            break

    return results


def main():
    parser = argparse.ArgumentParser(description="Search stock videos/music")
    parser.add_argument("--query", required=True)
    parser.add_argument("--source", default="pixabay", choices=["pixabay", "pexels"])
    parser.add_argument("--media-type", default="video", choices=["video", "music"])
    parser.add_argument("--orientation", default="landscape",
                       choices=["landscape", "portrait", "all"])
    parser.add_argument("--min-duration", type=int, default=5)
    parser.add_argument("--count", type=int, default=5)
    parser.add_argument("--api-key", default=None)

    args = parser.parse_args()

    if args.source == "pixabay":
        api_key = args.api_key or os.environ.get("PIXABAY_API_KEY")
        if not api_key:
            print(json.dumps({"error": True,
                "message": "Set PIXABAY_API_KEY env var or pass --api-key"}))
            sys.exit(1)

        if args.media_type == "music":
            results = search_pixabay_music(args.query, api_key, args.count)
        else:
            results = search_pixabay_videos(
                args.query, api_key, args.orientation,
                args.min_duration, args.count)

    elif args.source == "pexels":
        if args.media_type == "music":
            print(json.dumps({"error": True,
                "message": "Pexels does not support music search. Use --source pixabay"}))
            sys.exit(1)

        api_key = args.api_key or os.environ.get("PEXELS_API_KEY")
        if not api_key:
            print(json.dumps({"error": True,
                "message": "Set PEXELS_API_KEY env var or pass --api-key"}))
            sys.exit(1)

        results = search_pexels_videos(
            args.query, api_key, args.orientation,
            args.min_duration, args.count)

    print(json.dumps({
        "success": True,
        "source": args.source,
        "query": args.query,
        "count": len(results),
        "results": results,
    }, indent=2))


if __name__ == "__main__":
    main()
