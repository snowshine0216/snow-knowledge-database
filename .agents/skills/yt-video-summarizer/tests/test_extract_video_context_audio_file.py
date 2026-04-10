"""Tests: --audio-file flag bypasses platform_from_url() and dump_metadata()."""

import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

# Add the scripts directory to sys.path so we can import the module under test.
SCRIPTS_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS_DIR))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_fake_audio(tmp_path: Path) -> Path:
    """Write a non-empty WAV stub so the existence check passes."""
    wav = tmp_path / "lecture.wav"
    wav.write_bytes(b"RIFF" + b"\x00" * 40)
    return wav


def _run_main(argv: list[str]) -> int:
    """Run extract_video_context.main() with the given argv."""
    import extract_video_context as evc  # noqa: PLC0415

    with patch.object(sys, "argv", ["extract_video_context.py"] + argv):
        return evc.main()


# ---------------------------------------------------------------------------
# --audio-file: skips platform_from_url + dump_metadata
# ---------------------------------------------------------------------------


def test_audio_file_skips_platform_and_metadata(tmp_path):
    """--audio-file must not call platform_from_url() or dump_metadata()."""
    wav = _make_fake_audio(tmp_path)
    out_dir = tmp_path / "out"

    with (
        patch("extract_video_context.platform_from_url") as mock_platform,
        patch("extract_video_context.dump_metadata") as mock_dump,
        patch(
            "extract_video_context.transcribe_with_faster_whisper",
            return_value=("hello world", [], "tiny"),
        ),
    ):
        result = _run_main(["--audio-file", str(wav), "--out-dir", str(out_dir)])

    assert result == 0
    mock_platform.assert_not_called()
    mock_dump.assert_not_called()


def test_audio_file_writes_transcript(tmp_path):
    """--audio-file mode writes transcript.txt from ASR output."""
    wav = _make_fake_audio(tmp_path)
    out_dir = tmp_path / "out"

    with (
        patch("extract_video_context.platform_from_url"),
        patch("extract_video_context.dump_metadata"),
        patch(
            "extract_video_context.transcribe_with_faster_whisper",
            return_value=("hello world", [], "tiny"),
        ),
    ):
        _run_main(["--audio-file", str(wav), "--out-dir", str(out_dir)])

    transcript = (out_dir / "transcript.txt").read_text(encoding="utf-8").strip()
    assert transcript == "hello world"


def test_audio_file_bundle_has_local_platform(tmp_path):
    """bundle.json must report platform='local' and url=null."""
    wav = _make_fake_audio(tmp_path)
    out_dir = tmp_path / "out"

    with (
        patch("extract_video_context.platform_from_url"),
        patch("extract_video_context.dump_metadata"),
        patch(
            "extract_video_context.transcribe_with_faster_whisper",
            return_value=("text", [], "tiny"),
        ),
    ):
        _run_main(["--audio-file", str(wav), "--out-dir", str(out_dir)])

    bundle = json.loads((out_dir / "bundle.json").read_text(encoding="utf-8"))
    assert bundle["platform"] == "local"
    assert bundle["url"] is None
    assert bundle["audio_file"] == str(wav)


def test_audio_file_missing_returns_error(tmp_path):
    """--audio-file pointing to a non-existent file must exit with return code 1."""
    out_dir = tmp_path / "out"

    result = _run_main(
        ["--audio-file", str(tmp_path / "nonexistent.wav"), "--out-dir", str(out_dir)]
    )
    assert result == 1


def test_audio_file_asr_error_recorded(tmp_path):
    """ASR failure is captured in bundle.json as asr_error, not a crash."""
    wav = _make_fake_audio(tmp_path)
    out_dir = tmp_path / "out"

    with (
        patch("extract_video_context.platform_from_url"),
        patch("extract_video_context.dump_metadata"),
        patch(
            "extract_video_context.transcribe_with_faster_whisper",
            side_effect=RuntimeError("model load failed"),
        ),
        patch(
            "extract_video_context.transcribe_with_openai",
            side_effect=RuntimeError("openai error"),
        ),
    ):
        result = _run_main(["--audio-file", str(wav), "--out-dir", str(out_dir)])

    assert result == 0
    bundle = json.loads((out_dir / "bundle.json").read_text(encoding="utf-8"))
    assert bundle["asr_error"] is not None
    assert "faster-whisper" in bundle["asr_error"]
    assert not (out_dir / "transcript.txt").exists()


# ---------------------------------------------------------------------------
# --url: existing path unchanged (regression)
# ---------------------------------------------------------------------------


def test_url_path_calls_platform_and_metadata(tmp_path):
    """--url path must still call platform_from_url() and dump_metadata()."""
    out_dir = tmp_path / "out"

    fake_meta = {"id": "abc123", "title": "Test", "uploader": "tester"}
    fake_summary = {
        "id": "abc123",
        "title": "Test",
        "url": "https://youtu.be/abc123",
        "platform": "youtube",
        "original_language": "en",
        "chapters": [],
    }

    with (
        patch("extract_video_context.platform_from_url", return_value="youtube") as mock_platform,
        patch(
            "extract_video_context.dump_metadata",
            return_value=(fake_meta, False),
        ) as mock_dump,
        patch("extract_video_context.normalize_metadata", return_value=fake_summary),
        patch("extract_video_context.fetch_subtitles", return_value=False),
        patch(
            "extract_video_context.select_subtitle_file_for_language",
            return_value=(None, None),
        ),
    ):
        _run_main(["--url", "https://youtu.be/abc123", "--out-dir", str(out_dir), "--metadata-only"])

    mock_platform.assert_called_once_with("https://youtu.be/abc123")
    mock_dump.assert_called_once()


def test_neither_url_nor_audio_file_exits(tmp_path):
    """Omitting both --url and --audio-file must call parser.error()."""
    out_dir = tmp_path / "out"
    with pytest.raises(SystemExit) as exc_info:
        _run_main(["--out-dir", str(out_dir)])
    assert exc_info.value.code != 0
