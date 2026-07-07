"""queue_io.py — Impure edges for the EVC queue: persistence, disk probing, paths.

Everything here touches the filesystem. Pure decisions stay in queue_core; this
module only reads/writes JSON, resolves repo-relative artifact paths, and reports
what exists on disk so queue_core.reconcile can make decisions.
"""
import json
import os
import re

QUEUE_ROOT = "tmp/evc"          # under repo root; gitignored
COURSES_ROOT = "courses"        # committed lecture markdown


def queue_dir(repo_root, slug):
    return os.path.join(repo_root, QUEUE_ROOT, slug)


def queue_path(repo_root, slug):
    return os.path.join(queue_dir(repo_root, slug), "queue.json")


def audio_dir(repo_root, slug):
    return os.path.join(queue_dir(repo_root, slug), "audio")


def load_queue(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def save_queue(path, queue):
    """Atomically flush the queue so a crash mid-write never truncates state."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = f"{path}.tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(queue, fh, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def slugify_ascii(text, fallback):
    """ASCII-only, lowercase, hyphenated slug; `fallback` if nothing survives."""
    ascii_only = re.sub(r"[^\x00-\x7f]", " ", text or "")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_only.lower()).strip("-")
    return slug[:60] or fallback


def artifact_paths(slug, course_name, idx, title_ascii, module):
    """Repo-relative artifact paths for one lecture (stable across reboots)."""
    course_sub = os.path.join(COURSES_ROOT, course_name, module) if module \
        else os.path.join(COURSES_ROOT, course_name)
    return {
        "audio": os.path.join(QUEUE_ROOT, slug, "audio", f"tmp_{idx}.wav"),
        "transcript": os.path.join(QUEUE_ROOT, slug, "audio", f"asr_{idx}", "transcript.txt"),
        "summary": os.path.join(course_sub, f"{idx}-{title_ascii}.md"),
    }


def build_lecture_entries(slug, course_name, raw_lectures):
    """Map adapter enumerate() output to queue lecture dicts with artifact paths."""
    entries = []
    for lec in raw_lectures:
        idx = str(lec["idx"]).zfill(3)
        title = lec.get("title") or f"lecture-{idx}"
        title_ascii = slugify_ascii(title, f"lecture-{idx}")
        module = _module_slug(lec)
        entries.append({
            "idx": idx, "title": title, "titleAscii": title_ascii,
            "url": lec["url"], "duration": lec.get("duration") or 0,
            "module": module,
            "artifacts": artifact_paths(slug, course_name, idx, title_ascii, module),
        })
    return entries


def _module_slug(lec):
    mt = lec.get("module_title") or ""
    return slugify_ascii(mt, "") if mt else ""


def _nonempty(repo_root, rel_path):
    if not rel_path:
        return False
    full = os.path.join(repo_root, rel_path)
    return os.path.isfile(full) and os.path.getsize(full) > 0


def has_artifact(repo_root, lec, key):
    """True if the lecture's `key` artifact (audio/transcript/summary) exists."""
    return _nonempty(repo_root, lec.get("artifacts", {}).get(key))


def gather_disk_facts(queue, repo_root):
    """Report which artifacts actually exist on disk, per lecture."""
    facts = {}
    for idx, lec in queue["lectures"].items():
        art = lec.get("artifacts", {})
        facts[idx] = {
            "audio": _nonempty(repo_root, art.get("audio")),
            "transcript": _nonempty(repo_root, art.get("transcript")),
            "summary": _nonempty(repo_root, art.get("summary")),
        }
    return facts
