#!/usr/bin/env python3
"""Fetch public-safe Spotify listening stats into data/spotify.json (stdlib only)."""
import base64, json, os, sys, urllib.parse, urllib.request
from datetime import datetime, timezone

def req(url, data=None, headers=None):
    r = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(r, timeout=30) as resp:
        body = resp.read()
        return resp.status, (json.loads(body) if body else None)

def token():
    cid, sec, rt = (os.environ[k] for k in ("SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN"))
    auth = base64.b64encode(f"{cid}:{sec}".encode()).decode()
    data = urllib.parse.urlencode({"grant_type": "refresh_token", "refresh_token": rt}).encode()
    _, j = req("https://accounts.spotify.com/api/token", data, {"Authorization": "Basic " + auth, "Content-Type": "application/x-www-form-urlencoded"})
    return j["access_token"]

def img(images, prefer=64):
    if not images: return None
    return sorted(images, key=lambda i: abs((i.get("width") or prefer) - prefer))[0]["url"]

def track(t):
    return {"name": t["name"], "artists": [a["name"] for a in t.get("artists", [])],
            "album": t.get("album", {}).get("name"), "image": img(t.get("album", {}).get("images")),
            "url": t.get("external_urls", {}).get("spotify")}

def main():
    tok = token(); H = {"Authorization": "Bearer " + tok}
    api = lambda p: req("https://api.spotify.com/v1/" + p, headers=H)[1]
    out = {"recently_played": [], "top_artists": [], "top_tracks": [], "now_playing": None}
    for it in (api("me/player/recently-played?limit=10") or {}).get("items", []):
        d = track(it["track"]); d["played_at"] = it.get("played_at"); out["recently_played"].append(d)
    for a in (api("me/top/artists?time_range=short_term&limit=5") or {}).get("items", []):
        out["top_artists"].append({"name": a["name"], "image": img(a.get("images"), 160), "url": a.get("external_urls", {}).get("spotify")})
    out["top_tracks"] = [track(t) for t in (api("me/top/tracks?time_range=short_term&limit=5") or {}).get("items", [])]
    try:
        cp = api("me/player/currently-playing")
        if cp and cp.get("is_playing") and cp.get("item") and cp.get("currently_playing_type") == "track":
            out["now_playing"] = track(cp["item"])
    except Exception:
        pass
    path = os.path.join(os.path.dirname(__file__), "..", "data", "spotify.json")
    old = None
    if os.path.exists(path):
        with open(path) as f:
            try: old = json.load(f); old.pop("updated_at", None)
            except Exception: old = None
    if old == out:
        print("No change"); return
    out["updated_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with open(path, "w") as f: json.dump(out, f, indent=1, ensure_ascii=False)
    print("Updated")

if __name__ == "__main__":
    try: main()
    except Exception as e: print("Error:", type(e).__name__, e, file=sys.stderr); sys.exit(1)
