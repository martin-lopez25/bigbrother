"""Local dashboard API for free public web search sources."""

from __future__ import annotations

import json
import mimetypes
import http.cookiejar
import os
import re
import shutil
import subprocess
import sys
import threading
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
FRONTEND_DIST = ROOT / "frontend" / "dist"
USER_AGENT = "OjoDeDios/0.1 (free public search dashboard)"
MAX_RESPONSE_BYTES = 2_000_000
TIMEOUT_SECONDS = 12
MAX_RESULTS_PER_SOURCE = 10
MAX_QUERY_LENGTH = 180

SOURCES = {
    "news": "Google News",
    "hackernews": "Hacker News",
    "wikipedia": "Wikipedia ES",
    "youtube": "YouTube",
    "bilibili": "Bilibili",
    "instagram": "Instagram Explore",
    "reddit": "Reddit",
    "twitter": "X / Twitter",
    "facebook": "Facebook",
    "xiaohongshu": "XiaoHongShu",
}
SOCIAL_SOURCES = {"instagram", "reddit", "twitter", "facebook", "xiaohongshu"}
_DOCTOR_CACHE: tuple[float, dict[str, Any]] | None = None
_DOCTOR_LOCK = threading.Lock()

STOP_WORDS = set(
    "a al algo algunas algunos ante antes como con contra cual cuando de del desde donde "
    "dos durante e el ella ellas ellos en entre era erais eran eras eres es esa esas ese "
    "eso esos esta estaba estaban estado estamos están estar estas este esto estos fue "
    "fueron ha hacia hasta hay la las le les lo los más mas me mi mis mucho muy nada ni "
    "no nos o otra otras otro otros para pero poco por porque que quien se sea ser si sin "
    "sobre son su sus te tiene todo todos tu tus un una unas uno unos y ya the that this "
    "with from have has into about were will your their there they them what when where "
    "which while for and are was not but you our out can its more than also just how all "
    "been being after before between into over such than then these those who why"
    .split()
)


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


class SourceSetupRequired(RuntimeError):
    pass


def clean_text(value: str | None) -> str:
    parser = _TextExtractor()
    parser.feed(value or "")
    text = " ".join(parser.parts)
    return re.sub(r"\s+", " ", text).strip()


def _fetch(url: str, accept: str) -> bytes:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": accept},
    )
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        body = response.read(MAX_RESPONSE_BYTES + 1)
    if len(body) > MAX_RESPONSE_BYTES:
        raise ValueError("La respuesta supera el límite de tamaño")
    return body


def _safe_link(value: str | None) -> str:
    parsed = urllib.parse.urlsplit(value or "")
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        return ""
    if parsed.username or parsed.password:
        return ""
    return value or ""


def _parse_date(value: str | None) -> str | None:
    if not value:
        return None
    try:
        parsed = parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat()
    except (TypeError, ValueError, OverflowError):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc).isoformat()
        except (TypeError, ValueError, OverflowError):
            return None


def _result(
    *,
    source: str,
    title: str,
    url: str,
    excerpt: str,
    published_at: str | None = None,
    publisher: str | None = None,
    points: int | None = None,
    views: int | None = None,
) -> dict[str, Any] | None:
    link = _safe_link(url)
    title = clean_text(title)
    if not link or not title:
        return None
    parsed = urllib.parse.urlsplit(link)
    return {
        "id": f"{source}:{link}",
        "source": SOURCES[source],
        "sourceKey": source,
        "title": title[:300],
        "url": link,
        "domain": parsed.hostname or "",
        "publisher": clean_text(publisher)[:100] if publisher else parsed.hostname,
        "excerpt": clean_text(excerpt)[:700],
        "publishedAt": published_at,
        "points": points,
        "views": views,
    }


def _news_excerpt(title: str, description: str | None, publisher: str | None) -> str:
    excerpt = clean_text(description)
    normalized_title = clean_text(title).casefold()
    if not normalized_title or not excerpt.casefold().startswith(normalized_title):
        return excerpt
    remainder = excerpt[len(clean_text(title)) :].strip(" -—:|.")
    if publisher and remainder.casefold().startswith(publisher.casefold()):
        remainder = remainder[len(publisher) :].strip(" -—:|.")
    return remainder if len(remainder) >= 60 else ""


def _news_title(title: str, publisher: str | None) -> str:
    if publisher and title.casefold().endswith(publisher.casefold()):
        title = title[: -len(publisher)].rstrip(" -—:|.")
    return title


def search_news(query: str) -> list[dict[str, Any]]:
    params = urllib.parse.urlencode(
        {"q": query, "hl": "es-419", "gl": "MX", "ceid": "MX:es-419"}
    )
    body = _fetch(
        f"https://news.google.com/rss/search?{params}",
        "application/rss+xml, application/xml, text/xml",
    )
    root = ET.fromstring(body)
    items = root.findall("./channel/item")
    results = []
    for item in items[:MAX_RESULTS_PER_SOURCE]:
        source = item.findtext("source")
        title = item.findtext("title") or ""
        if source:
            title = _news_title(title, source)
        elif " - " in title:
            title, source = title.rsplit(" - ", 1)
        result = _result(
            source="news",
            title=title,
            url=item.findtext("link") or "",
            excerpt=_news_excerpt(title, item.findtext("description"), source),
            published_at=_parse_date(item.findtext("pubDate")),
            publisher=source,
        )
        if result:
            results.append(result)
    return results


def search_hackernews(query: str) -> list[dict[str, Any]]:
    params = urllib.parse.urlencode(
        {"query": query, "tags": "story", "hitsPerPage": MAX_RESULTS_PER_SOURCE}
    )
    body = _fetch(
        f"https://hn.algolia.com/api/v1/search?{params}", "application/json"
    )
    payload = json.loads(body)
    results = []
    for item in payload.get("hits", []):
        title = item.get("title") or item.get("story_title") or ""
        url = item.get("url") or item.get("story_url") or ""
        excerpt = item.get("story_text") or item.get("comment_text") or title
        result = _result(
            source="hackernews",
            title=title,
            url=url,
            excerpt=excerpt,
            published_at=_parse_date(item.get("created_at")),
            points=item.get("points"),
        )
        if result:
            results.append(result)
    return results


def search_wikipedia(query: str) -> list[dict[str, Any]]:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "srlimit": MAX_RESULTS_PER_SOURCE,
            "format": "json",
        }
    )
    body = _fetch(
        f"https://es.wikipedia.org/w/api.php?{params}", "application/json"
    )
    payload = json.loads(body)
    results = []
    for item in payload.get("query", {}).get("search", []):
        title = item.get("title") or ""
        page = urllib.parse.quote(title.replace(" ", "_"), safe="()!,")
        result = _result(
            source="wikipedia",
            title=title,
            url=f"https://es.wikipedia.org/wiki/{page}",
            excerpt=item.get("snippet") or title,
        )
        if result:
            results.append(result)
    return results


def _parse_upload_date(value: str | None) -> str | None:
    if not value:
        return None
    try:
        parsed = datetime.strptime(value, "%Y%m%d").replace(tzinfo=timezone.utc)
        return parsed.isoformat()
    except ValueError:
        return _parse_date(value)


def _youtube_result(item: dict[str, Any]) -> dict[str, Any] | None:
    video_id = str(item.get("id") or "").strip()
    title = item.get("title") or ""
    if not video_id or not title:
        return None
    result = _result(
        source="youtube",
        title=title,
        url=f"https://www.youtube.com/watch?v={urllib.parse.quote(video_id, safe='-_')}",
        excerpt=item.get("description") or "",
        published_at=_parse_upload_date(item.get("upload_date")),
        publisher=item.get("channel") or item.get("uploader"),
        views=item.get("view_count") if isinstance(item.get("view_count"), int) else None,
    )
    if result:
        result["videoId"] = video_id
    return result


def search_youtube(query: str) -> list[dict[str, Any]]:
    command = [
        sys.executable,
        "-m",
        "yt_dlp",
        "--no-warnings",
        "--flat-playlist",
        "--dump-json",
        "--playlist-end",
        str(MAX_RESULTS_PER_SOURCE),
        f"ytsearch{MAX_RESULTS_PER_SOURCE}:{query}",
    ]
    try:
        completed = subprocess.run(
            command,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=40,
            check=False,
        )
    except FileNotFoundError as exc:
        raise SourceSetupRequired(
            "YouTube necesita yt-dlp en el entorno Python del dashboard."
        ) from exc
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("YouTube tardó demasiado en responder.") from exc

    results = []
    for line in completed.stdout.splitlines():
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        result = _youtube_result(item)
        if result:
            results.append(result)
    if completed.returncode and not results:
        raise RuntimeError("YouTube no respondió a la búsqueda.")
    return results[:MAX_RESULTS_PER_SOURCE]


def _parse_vtt(content: str, max_characters: int = 160_000) -> str:
    lines: list[str] = []
    previous = ""
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if (
            not line
            or line.startswith(("WEBVTT", "Kind:", "Language:"))
            or "-->" in line
            or line.isdigit()
        ):
            continue
        line = re.sub(r"<\d{2}:\d{2}:\d{2}\.\d{3}>", "", line)
        text = clean_text(line).strip("♪♫ ")
        if not text or text == previous:
            continue
        lines.append(text)
        previous = text
        if sum(map(len, lines)) >= max_characters:
            break
    return " ".join(lines)[:max_characters]


def summarize_youtube_video(video_id: str) -> dict[str, Any]:
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        raise ValueError("Identificador de video de YouTube no válido.")

    video_url = f"https://www.youtube.com/watch?v={video_id}"
    with tempfile.TemporaryDirectory(prefix="ojo-de-dios-youtube-") as temp_dir:
        output = str(Path(temp_dir) / "%(id)s.%(ext)s")
        subtitle_files: list[Path] = []
        language = "es"

        for language, language_selector in (("es", "es.*,es"), ("en", "en.*,en")):
            command = [
                sys.executable,
                "-m",
                "yt_dlp",
                "--no-warnings",
                "--no-playlist",
                "--skip-download",
                "--write-subs",
                "--write-auto-subs",
                "--sub-langs",
                language_selector,
                "--sub-format",
                "vtt",
                "--output",
                output,
                video_url,
            ]
            try:
                subprocess.run(
                    command,
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="replace",
                    timeout=50,
                    check=False,
                )
            except FileNotFoundError as exc:
                raise SourceSetupRequired("YouTube necesita yt-dlp en este entorno.") from exc
            subtitle_files = list(Path(temp_dir).glob("*.vtt"))
            if subtitle_files:
                break

        if not subtitle_files:
            raise SourceSetupRequired(
                "Este video no ofrece subtítulos públicos en español o inglés."
            )

        subtitle_files.sort(key=lambda path: ("orig" in path.name, path.name))
        transcript = ""
        for subtitle_file in subtitle_files:
            transcript = _parse_vtt(subtitle_file.read_text(encoding="utf-8", errors="replace"))
            if len(transcript) >= 80:
                language_match = re.search(r"\.([a-z]{2,3})(?:[-.])", subtitle_file.name)
                if language_match:
                    language = language_match.group(1)
                break

    if len(transcript) < 80:
        raise SourceSetupRequired("Los subtítulos públicos de este video están vacíos.")

    summary = summarize_transcript(transcript)
    return {
        "videoId": video_id,
        "summary": summary,
        "language": language,
        "transcriptCharacters": len(transcript),
        "method": "Subtítulos públicos + resumen extractivo local",
    }


def _bilibili_result(item: dict[str, Any]) -> dict[str, Any] | None:
    video_url = item.get("arcurl") or item.get("url") or ""
    if video_url.startswith("http://"):
        video_url = "https://" + video_url[len("http://") :]
    timestamp = item.get("pubdate")
    published_at = None
    if isinstance(timestamp, (int, float)) and timestamp > 0:
        published_at = datetime.fromtimestamp(timestamp, timezone.utc).isoformat()
    return _result(
        source="bilibili",
        title=item.get("title") or "",
        url=video_url,
        excerpt=item.get("description") or item.get("desc") or "",
        published_at=published_at,
        publisher=item.get("author") or (item.get("owner") or {}).get("name"),
        views=item.get("play") if isinstance(item.get("play"), int) else None,
    )


def _fetch_bilibili_search(query: str) -> dict[str, Any]:
    user_agent = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36"
    )
    cookie_jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(cookie_jar)
    )
    home = urllib.request.Request(
        "https://www.bilibili.com/", headers={"User-Agent": user_agent}
    )
    with opener.open(home, timeout=TIMEOUT_SECONDS):
        pass

    params = urllib.parse.urlencode({"keyword": query, "page": 1})
    request = urllib.request.Request(
        f"https://api.bilibili.com/x/web-interface/search/all/v2?{params}",
        headers={"User-Agent": user_agent, "Referer": "https://www.bilibili.com/"},
    )
    with opener.open(request, timeout=TIMEOUT_SECONDS) as response:
        body = response.read(MAX_RESPONSE_BYTES + 1)
    if len(body) > MAX_RESPONSE_BYTES:
        raise ValueError("La respuesta de Bilibili supera el límite de tamaño")
    return json.loads(body)


def search_bilibili(query: str) -> list[dict[str, Any]]:
    payload = _fetch_bilibili_search(query)
    if payload.get("code") != 0:
        raise RuntimeError("Bilibili no respondió a la búsqueda pública.")
    groups = payload.get("data", {}).get("result", [])
    items = [
        item
        for group in groups
        if group.get("result_type") == "video"
        for item in group.get("data", [])
    ]
    return [
        result
        for item in items[:MAX_RESULTS_PER_SOURCE]
        if (result := _bilibili_result(item)) is not None
    ]


def _instagram_items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for value in payload for item in _instagram_items(value)]
    if not isinstance(payload, dict):
        return []
    if any(
        key in payload
        for key in ("username", "full_name", "profile_url", "shortcode", "permalink")
    ):
        return [payload]
    for key in ("results", "items", "data", "users", "profiles", "posts", "edges"):
        if key in payload:
            return _instagram_items(payload[key])
    return []


def _instagram_result(item: dict[str, Any]) -> dict[str, Any] | None:
    username = str(item.get("username") or item.get("user_name") or "").lstrip("@")
    shortcode = item.get("shortcode") or item.get("code")
    caption = item.get("caption") or item.get("caption_text") or item.get("description") or ""
    title = item.get("title") or item.get("full_name") or item.get("name") or caption or username
    url = item.get("permalink") or item.get("post_url") or item.get("profile_url") or item.get("url")
    if url and url.startswith("/"):
        url = f"https://www.instagram.com{url}"
    if not url and shortcode:
        url = f"https://www.instagram.com/p/{urllib.parse.quote(str(shortcode), safe='-_')}/"
    if not url and username:
        url = f"https://www.instagram.com/{urllib.parse.quote(username, safe='._')}/"
    return _result(
        source="instagram",
        title=clean_text(str(title))[:180],
        url=url or "",
        excerpt=caption or item.get("biography") or item.get("bio") or "",
        publisher=f"@{username}" if username else "Instagram Explore",
        views=item.get("view_count") if isinstance(item.get("view_count"), int) else None,
    )


def search_instagram(_query: str) -> list[dict[str, Any]]:
    if not shutil.which("opencli"):
        raise SourceSetupRequired(
            "Instagram requiere OpenCLI y una sesión de Chrome ya iniciada y controlada por ti."
        )
    try:
        import yaml
    except ImportError as exc:
        raise SourceSetupRequired(
            "Instagram necesita PyYAML para leer la salida local de OpenCLI."
        ) from exc

    try:
        completed = subprocess.run(
            _opencli_command(["opencli", "instagram", "explore", "--limit", str(MAX_RESULTS_PER_SOURCE), "-f", "yaml"]),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=25,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("Instagram tardó demasiado en responder.") from exc
    if completed.returncode:
        raise RuntimeError("Instagram no respondió a través de OpenCLI.")

    try:
        payload = yaml.safe_load(completed.stdout)
    except yaml.YAMLError as exc:
        raise RuntimeError("OpenCLI devolvió datos que no se pudieron interpretar.") from exc

    results = []
    for item in _instagram_items(payload)[:MAX_RESULTS_PER_SOURCE]:
        result = _instagram_result(item)
        if result:
            results.append(result)
    return results


def _reddit_items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for value in payload for item in _reddit_items(value)]
    if not isinstance(payload, dict):
        return []
    if payload.get("title") and any(key in payload for key in ("permalink", "post_url", "url")):
        return [payload]
    for key in ("results", "items", "data", "posts", "children"):
        if key in payload:
            return _reddit_items(payload[key])
    return []


def _reddit_result(item: dict[str, Any]) -> dict[str, Any] | None:
    url = item.get("permalink") or item.get("post_url") or item.get("url") or ""
    if url.startswith("/"):
        url = f"https://www.reddit.com{url}"
    subreddit = item.get("subreddit") or item.get("subreddit_name_prefixed") or "Reddit"
    excerpt = item.get("selftext") or item.get("text") or item.get("description") or ""
    return _result(
        source="reddit",
        title=item.get("title") or "",
        url=url,
        excerpt=excerpt,
        published_at=_parse_date(item.get("created_at")),
        publisher=subreddit,
        points=item.get("score") if isinstance(item.get("score"), int) else None,
    )


def search_reddit(query: str) -> list[dict[str, Any]]:
    channels = _agent_reach_doctor()
    channel = channels.get("reddit", {})
    if shutil.which("opencli") and "OpenCLI" in channel.get("backends", []):
        payload = _load_opencli_yaml(
            ["opencli", "reddit", "search", query, "-f", "yaml"]
        )
    elif (
        channel.get("active_backend") == "rdt-cli"
        and shutil.which("rdt")
    ):
        try:
            import yaml
        except ImportError as exc:
            raise SourceSetupRequired("Reddit necesita PyYAML para leer rdt-cli.") from exc
        completed = subprocess.run(
            ["rdt", "search", query, "--limit", str(MAX_RESULTS_PER_SOURCE), "--yaml"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
            check=False,
        )
        if completed.returncode:
            raise RuntimeError("rdt-cli no pudo consultar Reddit.")
        try:
            payload = yaml.safe_load(completed.stdout)
        except yaml.YAMLError as exc:
            raise RuntimeError("rdt-cli devolvió datos que no se pudieron interpretar.") from exc
    else:
        raise SourceSetupRequired(_social_setup_message("reddit", channels) or "Reddit requiere una sesión iniciada.")

    return [
        result
        for item in _reddit_items(payload)[:MAX_RESULTS_PER_SOURCE]
        if (result := _reddit_result(item)) is not None
    ]


def _agent_reach_doctor() -> dict[str, Any]:
    global _DOCTOR_CACHE
    now = time.monotonic()
    if _DOCTOR_CACHE and now - _DOCTOR_CACHE[0] < 20:
        return _DOCTOR_CACHE[1]
    with _DOCTOR_LOCK:
        now = time.monotonic()
        if _DOCTOR_CACHE and now - _DOCTOR_CACHE[0] < 20:
            return _DOCTOR_CACHE[1]
        try:
            result = subprocess.run(
                [sys.executable, "-m", "agent_reach.cli", "doctor", "--json"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=20,
                check=False,
            )
            channels = json.loads(result.stdout) if result.returncode == 0 else {}
            if not isinstance(channels, dict):
                channels = {}
        except (OSError, subprocess.TimeoutExpired, json.JSONDecodeError):
            channels = {}
        _DOCTOR_CACHE = (time.monotonic(), channels)
        return channels


def _social_setup_message(source: str, channels: dict[str, Any]) -> str | None:
    channel = channels.get(source, {})
    backends = channel.get("backends", [])
    active = channel.get("active_backend")

    if source == "twitter" and active == "twitter-cli":
        if shutil.which("twitter") and os.environ.get("TWITTER_AUTH_TOKEN") and os.environ.get("TWITTER_CT0"):
            return None
        return "X requiere TWITTER_AUTH_TOKEN y TWITTER_CT0 explícitos en el entorno local."

    if (
        source == "twitter"
        and shutil.which("twitter")
        and os.environ.get("TWITTER_AUTH_TOKEN")
        and os.environ.get("TWITTER_CT0")
    ):
        return None

    if source == "reddit" and active == "rdt-cli" and shutil.which("rdt"):
        return None

    if active == "OpenCLI":
        return None

    opencli_ready_to_try = (
        shutil.which("opencli")
        and "OpenCLI" in backends
        and channel.get("status") in {"ok", "warn"}
    )
    if opencli_ready_to_try:
        return None

    return channel.get("message") or (
        f"{SOURCES[source]} no tiene un backend activo en Agent Reach. "
        "Ejecuta agent-reach doctor --json para ver cómo configurarlo."
    )


def _opencli_command(command: list[str]) -> list[str]:
    if os.name != "nt" or not command or command[0] != "opencli":
        return command

    executable = shutil.which(command[0])
    if not executable or os.path.splitext(executable)[1].lower() not in {".bat", ".cmd"}:
        return command

    script = os.path.splitext(executable)[0] + ".ps1"
    powershell = shutil.which("powershell") or shutil.which("pwsh")
    if not powershell and os.environ.get("SystemRoot"):
        candidate = os.path.join(
            os.environ["SystemRoot"],
            "System32",
            "WindowsPowerShell",
            "v1.0",
            "powershell.exe",
        )
        if os.path.isfile(candidate):
            powershell = candidate
    if not powershell or not os.path.isfile(script):
        raise FileNotFoundError(
            "OpenCLI's Windows PowerShell launcher was not found. Reinstall OpenCLI with npm."
        )

    return [
        powershell,
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        script,
        *command[1:],
    ]


def _load_opencli_yaml(command: list[str]) -> Any:
    try:
        import yaml
    except ImportError as exc:
        raise SourceSetupRequired(
            "La salida de OpenCLI requiere PyYAML en el entorno del dashboard."
        ) from exc
    try:
        completed = subprocess.run(
            _opencli_command(command),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError("OpenCLI tardó demasiado en responder.") from exc
    if completed.returncode:
        raise RuntimeError("OpenCLI no pudo consultar la sesión configurada.")
    try:
        return yaml.safe_load(completed.stdout)
    except yaml.YAMLError as exc:
        raise RuntimeError("OpenCLI devolvió datos que no se pudieron interpretar.") from exc


def _social_items(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for value in payload for item in _social_items(value)]
    if not isinstance(payload, dict):
        return []
    if any(
        key in payload
        for key in ("title", "text", "message", "username", "full_name", "shortcode")
    ) and any(key in payload for key in ("url", "link", "permalink", "post_url", "arcurl", "profile_url")):
        return [payload]
    for key in ("results", "items", "data", "posts", "users", "profiles", "edges", "children"):
        if key in payload:
            return _social_items(payload[key])
    return []


def _social_result(source: str, item: dict[str, Any]) -> dict[str, Any] | None:
    if source == "instagram":
        return _instagram_result(item)
    if source == "reddit":
        return _reddit_result(item)

    username = str(item.get("username") or item.get("handle") or item.get("author") or "").lstrip("@")
    identifier = item.get("id") or item.get("post_id") or item.get("tweet_id")
    title = item.get("title") or item.get("text") or item.get("message") or item.get("full_name") or username
    excerpt = item.get("text") or item.get("message") or item.get("caption") or item.get("description") or ""
    url = item.get("url") or item.get("link") or item.get("permalink") or item.get("post_url") or item.get("profile_url")
    if url and str(url).startswith("/"):
        domain = "x.com" if source == "twitter" else "www.facebook.com" if source == "facebook" else "www.xiaohongshu.com"
        url = f"https://{domain}{url}"
    if not url and source == "twitter" and username and identifier:
        url = f"https://x.com/{urllib.parse.quote(username, safe='._')}/status/{urllib.parse.quote(str(identifier), safe='-')}"
    if not url and source == "xiaohongshu" and identifier:
        url = f"https://www.xiaohongshu.com/explore/{urllib.parse.quote(str(identifier), safe='-')}"

    published = item.get("created_at") or item.get("published_at") or item.get("date")
    if isinstance(published, (int, float)) and published > 0:
        published_at = datetime.fromtimestamp(published, timezone.utc).isoformat()
    else:
        published_at = _parse_date(str(published)) if published else None
    return _result(
        source=source,
        title=clean_text(str(title))[:300],
        url=str(url or ""),
        excerpt=str(excerpt),
        published_at=published_at,
        publisher=f"@{username}" if source == "twitter" and username else username or SOURCES[source],
        points=item.get("likes") if isinstance(item.get("likes"), int) else None,
    )


def _search_opencli_social(source: str, query: str) -> list[dict[str, Any]]:
    if source == "instagram":
        command = ["opencli", "instagram", "explore", "--limit", str(MAX_RESULTS_PER_SOURCE), "-f", "yaml"]
    elif source == "facebook":
        command = ["opencli", "facebook", "search", query, "-f", "yaml"]
    elif source == "reddit":
        command = ["opencli", "reddit", "search", query, "-f", "yaml"]
    elif source == "twitter":
        command = ["opencli", "twitter", "search", query, "-f", "yaml"]
    else:
        command = ["opencli", "xiaohongshu", "search", query, "-f", "yaml"]

    records = _social_items(_load_opencli_yaml(command))
    return [
        result
        for item in records[:MAX_RESULTS_PER_SOURCE]
        if (result := _social_result(source, item)) is not None
    ]


def search_twitter(query: str) -> list[dict[str, Any]]:
    channels = _agent_reach_doctor()
    backend = (channels.get("twitter") or {}).get("active_backend")
    if backend == "OpenCLI" or (
        backend is None
        and shutil.which("opencli")
        and "OpenCLI" in (channels.get("twitter") or {}).get("backends", [])
    ):
        return _search_opencli_social("twitter", query)
    if backend == "twitter-cli" and shutil.which("twitter"):
        if not (os.environ.get("TWITTER_AUTH_TOKEN") and os.environ.get("TWITTER_CT0")):
            raise SourceSetupRequired("X requiere TWITTER_AUTH_TOKEN y TWITTER_CT0 explícitos en el entorno local.")
        completed = subprocess.run(
            ["twitter", "search", query, "-n", str(MAX_RESULTS_PER_SOURCE), "--json"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
            check=False,
        )
        if completed.returncode:
            raise RuntimeError("twitter-cli no pudo consultar X.")
        try:
            payload = json.loads(completed.stdout)
        except json.JSONDecodeError as exc:
            raise RuntimeError("twitter-cli devolvió datos que no se pudieron interpretar.") from exc
        return [
            result
            for item in _social_items(payload)[:MAX_RESULTS_PER_SOURCE]
            if (result := _social_result("twitter", item)) is not None
        ]
    raise SourceSetupRequired(_social_setup_message("twitter", channels) or "X no tiene un backend disponible.")


def search_facebook(query: str) -> list[dict[str, Any]]:
    return _search_opencli_social("facebook", query)


def search_xiaohongshu(query: str) -> list[dict[str, Any]]:
    return _search_opencli_social("xiaohongshu", query)


SEARCHERS = {
    "news": search_news,
    "hackernews": search_hackernews,
    "wikipedia": search_wikipedia,
    "youtube": search_youtube,
    "bilibili": search_bilibili,
    "instagram": search_instagram,
    "reddit": search_reddit,
    "twitter": search_twitter,
    "facebook": search_facebook,
    "xiaohongshu": search_xiaohongshu,
}

FACT_PATTERN = re.compile(
    r"(?<!\w)(?:[$€£]\s?\d[\d.,]*(?:\s?(?:millones?|mil|billones?|billion|million))?"
    r"|\d+(?:[.,]\d+)?\s?(?:%|por ciento|millones?|mil|billones?|billion|million)"
    r"|\b(?:19|20)\d{2}\b)",
    re.IGNORECASE,
)


def extract_facts(results: list[dict[str, Any]], limit: int = 8) -> list[str]:
    facts: list[str] = []
    seen: set[str] = set()
    for result in results:
        text = f"{result.get('title', '')}. {result.get('excerpt', '')}"
        for match in FACT_PATTERN.findall(text):
            fact = re.sub(r"\s+", " ", match).strip()
            key = fact.casefold()
            if key not in seen:
                seen.add(key)
                facts.append(fact)
                if len(facts) >= limit:
                    return facts
    return facts


def extract_keywords(results: list[dict[str, Any]], limit: int = 12) -> list[str]:
    counts: Counter[str] = Counter()
    display: dict[str, str] = {}
    for result in results:
        text = f"{result.get('title', '')} {result.get('excerpt', '')}"
        for word in re.findall(r"[^\W_]{4,}", text.casefold(), flags=re.UNICODE):
            if word in STOP_WORDS or word.isdigit():
                continue
            counts[word] += 1
            display.setdefault(word, word)
    return [display[word] for word, _ in counts.most_common(limit)]


def extractive_summary(results: list[dict[str, Any]], limit: int = 3) -> str:
    candidates: list[tuple[int, int, str]] = []
    frequency = Counter(extract_keywords(results, limit=30))
    seen: set[str] = set()
    for result in results:
        text = result.get("excerpt") or result.get("title", "")
        title = clean_text(result.get("title", "")).casefold()
        if clean_text(text).casefold() == title:
            continue
        if result.get("sourceKey") == "wikipedia" and re.search(
            r"\b(?:datos|data|categorías|categories|control de autoridades):",
            text,
            flags=re.IGNORECASE,
        ):
            continue
        for sentence in re.split(r"(?<=[.!?])\s+|\s+[—–]\s+", text):
            sentence = clean_text(sentence)
            key = sentence.casefold()
            if len(sentence) < 42 or key in seen:
                continue
            seen.add(key)
            words = re.findall(r"[^\W_]{4,}", key, flags=re.UNICODE)
            if len(words) < 8 or len(set(words)) / len(words) < 0.55:
                continue
            score = sum(frequency.get(word, 0) for word in set(words))
            candidates.append((score, min(len(sentence), 220), sentence))
    candidates.sort(key=lambda item: (item[0], item[1]), reverse=True)
    selected = [sentence for _, _, sentence in candidates[:limit]]
    if not selected:
        return (
            "Las fuentes ofrecen titulares y referencias, pero no suficientes "
            "fragmentos narrativos para resumir el tema con fiabilidad. "
            "Consulta los resultados y abre la fuente original."
        )
    excerpts = [
        sentence if sentence.endswith((".", "!", "?", "…")) else f"{sentence}…"
        for sentence in selected
    ]
    return "\n".join(f"• {sentence}" for sentence in excerpts)


def summarize_transcript(transcript: str, limit: int = 4) -> str:
    result = extractive_summary(
        [{"title": "Transcripción", "excerpt": transcript, "sourceKey": "youtube"}],
        limit=limit,
    )
    if not result.startswith("Las fuentes ofrecen titulares"):
        return result

    words = transcript.split()
    if len(words) < 20:
        return result
    normalized = [
        re.sub(r"[^\wáéíóúüñ-]", "", word.casefold(), flags=re.UNICODE)
        for word in words
    ]
    counts = Counter(
        word for word in normalized if len(word) > 3 and word not in STOP_WORDS
    )
    candidates: list[tuple[int, int, list[str]]] = []
    window_size = 24
    step = 16
    for start in range(0, len(words) - window_size + 1, step):
        chunk = words[start : start + window_size]
        unique = {
            token
            for token in normalized[start : start + window_size]
            if len(token) > 3 and token not in STOP_WORDS
        }
        if len(unique) < 5:
            continue
        score = sum(counts[token] for token in unique) / len(unique)
        candidates.append((int(score * 100), start, chunk))

    selected: list[tuple[int, list[str]]] = []
    for _, start, chunk in sorted(candidates, reverse=True):
        if any(abs(start - chosen_start) < window_size for chosen_start, _ in selected):
            continue
        selected.append((start, chunk))
        if len(selected) == limit:
            break
    selected.sort(key=lambda item: item[0])
    if not selected:
        return result
    return "\n".join(f"• {' '.join(chunk)}…" for _, chunk in selected)


def search(query: str, requested_sources: list[str]) -> dict[str, Any]:
    source_keys = [key for key in SEARCHERS if key in requested_sources]
    status: dict[str, dict[str, Any]] = {
        key: {"name": SOURCES[key], "status": "pending", "count": 0}
        for key in source_keys
    }
    results: list[dict[str, Any]] = []
    pending_sources = []
    social_channels = _agent_reach_doctor() if SOCIAL_SOURCES.intersection(source_keys) else {}
    for key in source_keys:
        if key in SOCIAL_SOURCES and (setup_message := _social_setup_message(key, social_channels)):
            status[key].update(
                status="setup_required",
                error=setup_message,
            )
        else:
            pending_sources.append(key)

    with ThreadPoolExecutor(max_workers=max(1, len(pending_sources))) as executor:
        futures = {
            executor.submit(SEARCHERS[key], query): key for key in pending_sources
        }
        for future in as_completed(futures):
            key = futures[future]
            try:
                source_results = future.result()
                status[key].update(status="ok", count=len(source_results))
                results.extend(source_results)
            except SourceSetupRequired as exc:
                status[key].update(status="setup_required", error=str(exc))
            except (OSError, ValueError, ET.ParseError, urllib.error.URLError) as exc:
                status[key].update(
                    status="error",
                    error=f"Fuente no disponible ({type(exc).__name__})",
                )
            except Exception as exc:  # Keep one source failure from hiding others.
                status[key].update(
                    status="error",
                    error=f"Fuente no disponible ({type(exc).__name__})",
                )

    unique: dict[str, dict[str, Any]] = {}
    for result in results:
        key = result["url"].casefold().rstrip("/")
        unique.setdefault(key, result)
    results = list(unique.values())
    results.sort(key=lambda item: item.get("publishedAt") or "", reverse=True)

    return {
        "query": query,
        "queriedAt": datetime.now(timezone.utc).isoformat(),
        "results": results,
        "sources": status,
        "summary": extractive_summary(results),
        "keywords": extract_keywords(results),
        "facts": extract_facts(results),
    }


class DashboardHandler(BaseHTTPRequestHandler):
    server_version = "OjoDeDios/0.1"

    def log_message(self, format: str, *args: Any) -> None:
        print(f"{self.address_string()} {self.command} {self.path.split('?')[0]}")

    def _send(self, body: bytes, content_type: str, status: int = 200) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self'; img-src 'self' https: data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path == "/api/youtube-summary":
            params = urllib.parse.parse_qs(parsed.query)
            video_id = (params.get("id") or [""])[0].strip()
            try:
                self._send_json(summarize_youtube_video(video_id))
            except ValueError as exc:
                self._send_json({"error": str(exc)}, 400)
            except SourceSetupRequired as exc:
                self._send_json({"error": str(exc)}, 422)
            except subprocess.TimeoutExpired:
                self._send_json({"error": "La descarga de subtítulos tardó demasiado."}, 504)
            except (OSError, urllib.error.URLError) as exc:
                self._send_json({"error": f"No se pudieron obtener los subtítulos ({type(exc).__name__})."}, 502)
            return

        if parsed.path == "/api/search":
            params = urllib.parse.parse_qs(parsed.query)
            query = (params.get("q") or [""])[0].strip()
            if not query:
                self._send_json({"error": "Escribe qué quieres investigar."}, 400)
                return
            if len(query) > MAX_QUERY_LENGTH:
                self._send_json({"error": "La búsqueda supera 180 caracteres."}, 400)
                return
            requested = (params.get("sources") or [","])[0].split(",")
            requested = [key for key in requested if key in SEARCHERS]
            if not requested:
                self._send_json({"error": "Selecciona al menos una fuente."}, 400)
                return
            self._send_json(search(query, requested))
            return

        static_root = FRONTEND_DIST if (FRONTEND_DIST / "index.html").is_file() else STATIC
        relative = urllib.parse.unquote(parsed.path).lstrip("/") or "index.html"
        path = (static_root / relative).resolve()
        root = static_root.resolve()
        try:
            path.relative_to(root)
        except ValueError:
            self._send(b"No encontrado", "text/plain; charset=utf-8", 404)
            return
        if path.is_dir():
            path = path / "index.html"
        if not path.is_file() and not Path(relative).suffix:
            path = root / "index.html"
        try:
            body = path.read_bytes()
        except OSError:
            self._send(b"Archivo no encontrado", "text/plain; charset=utf-8", 404)
            return
        guessed_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        content_type = f"{guessed_type}; charset=utf-8" if guessed_type.startswith(("text/", "application/javascript")) else guessed_type
        self._send(body, content_type)

    def _send_json(self, payload: dict[str, Any], status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self._send(body, "application/json; charset=utf-8", status)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Ojo de Dios free search dashboard")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), DashboardHandler)
    print(f"Dashboard listo en http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nCerrando dashboard...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()