#!/usr/bin/env python3

"""
Course processing script for yt-video-summarizer
Enumerates courses, tracks progress, and processes videos one by one
"""

import json
import os
import sys
import subprocess
import argparse
import datetime
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd,
                              capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {cmd}")
        print(f"Error: {e.stderr}")
        raise e

def sanitize_filename(text):
    """Sanitize text for use as filename"""
    import re
    # Keep ASCII, spaces, hyphens, and basic chars
    sanitized = re.sub(r'[^\w\s\-]', '', text)
    # Replace spaces with hyphens and lowercase
    sanitized = re.sub(r'\s+', '-', sanitized.strip()).lower()
    # Remove multiple consecutive hyphens
    sanitized = re.sub(r'-+', '-', sanitized)
    return sanitized[:80]  # Limit length

def enumerate_course(course_url, skill_dir):
    """Enumerate course using Playwright"""
    print(f"Enumerating course: {course_url}")

    enumerator_path = skill_dir / "playwright" / "course-enumerator.mjs"
    cmd = f"node {enumerator_path} \"{course_url}\""

    try:
        output = run_command(cmd, cwd=skill_dir)

        # Extract JSON result from output
        lines = output.split('\n')
        json_start = None
        for i, line in enumerate(lines):
            if line.strip() == "=== ENUMERATION RESULT ===":
                json_start = i + 1
                break

        if json_start is None:
            raise ValueError("Could not find enumeration result in output")

        json_output = '\n'.join(lines[json_start:])
        lessons = json.loads(json_output)

        return lessons

    except Exception as e:
        print(f"Enumeration failed: {e}")
        return []

def load_progress(progress_file):
    """Load progress from file"""
    if progress_file.exists():
        with open(progress_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        return {
            "courseUrl": "",
            "courseName": "",
            "enumeratedAt": "",
            "lessons": []
        }

def save_progress(progress_file, data):
    """Save progress to file"""
    progress_file.parent.mkdir(parents=True, exist_ok=True)
    with open(progress_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def process_video(video_url, skill_dir, target_dir, filename_prefix):
    """Process a single video using yt-video-summarizer"""
    print(f"Processing video: {video_url}")

    extractor_path = skill_dir / "scripts" / "extract_video_context.py"
    temp_dir = "/tmp/yt-video-summarizer"

    # Extract video metadata and transcript
    cmd = f'python3 "{extractor_path}" --url "{video_url}" --out-dir "{temp_dir}"'

    try:
        run_command(cmd, cwd=skill_dir)

        # Read extracted data
        temp_path = Path(temp_dir)
        metadata_file = temp_path / "metadata_summary.json"
        transcript_file = temp_path / "transcript.txt"

        if not metadata_file.exists():
            raise FileNotFoundError(f"Metadata file not found: {metadata_file}")

        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

        transcript = ""
        if transcript_file.exists():
            with open(transcript_file, 'r', encoding='utf-8') as f:
                transcript = f.read()

        # Determine content type (lecture-video for courses)
        content_type = "lecture-video"

        # Create output filename
        output_file = target_dir / f"{filename_prefix}.md"

        return {
            "metadata": metadata,
            "transcript": transcript,
            "content_type": content_type,
            "output_file": output_file,
            "source_url": video_url
        }

    except Exception as e:
        print(f"Video processing failed: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Process course videos")
    parser.add_argument("course_url", help="Course URL to process")
    parser.add_argument("--target-dir", default="courses", help="Target directory for output")
    parser.add_argument("--course-name", help="Override course name")
    parser.add_argument("--dry-run", action="store_true", help="Enumerate only, don't process")
    parser.add_argument("--resume", action="store_true", help="Resume from progress file")

    args = parser.parse_args()

    # Get skill directory
    skill_dir = Path(__file__).parent.parent
    target_base = Path(args.target_dir)

    # Enumerate course if not resuming
    if not args.resume:
        lessons = enumerate_course(args.course_url, skill_dir)

        if not lessons:
            print("No lessons found or enumeration failed")
            return 1

        # Determine course name
        if args.course_name:
            course_name = sanitize_filename(args.course_name)
        else:
            course_title = lessons[0].get("courseTitle", "unknown-course")
            course_name = sanitize_filename(course_title)

        course_dir = target_base / course_name
        progress_file = course_dir / "progress.md"

        # Create progress data
        progress = {
            "courseUrl": args.course_url,
            "courseName": course_name,
            "enumeratedAt": datetime.datetime.utcnow().isoformat() + "Z",
            "lessons": []
        }

        for lesson in lessons:
            progress["lessons"].append({
                "idx": lesson["idx"],
                "title": lesson["title"],
                "videoUrl": lesson.get("videoUrl"),
                "lessonUrl": lesson.get("lessonUrl"),
                "status": "pending",
                "outputFile": None,
                "processedAt": None
            })

        save_progress(progress_file, progress)

        print(f"\\nCourse: {course_title}")
        print(f"Found: {len(lessons)} lessons")
        print(f"Progress file: {progress_file}")

        if args.dry_run:
            print("\\n=== LESSONS ===")
            for lesson in lessons:
                status = "✓" if lesson.get("videoUrl") else "✗"
                print(f"{status} {lesson['idx']}: {lesson['title']}")
                if lesson.get("videoUrl"):
                    print(f"    Video: {lesson['videoUrl']}")
            return 0

    else:
        # Resume from existing progress
        if not args.course_name:
            print("--course-name required when using --resume")
            return 1

        course_name = sanitize_filename(args.course_name)
        course_dir = target_base / course_name
        progress_file = course_dir / "progress.md"

        if not progress_file.exists():
            print(f"Progress file not found: {progress_file}")
            return 1

        progress = load_progress(progress_file)
        lessons = progress["lessons"]

        print(f"Resuming course: {progress['courseName']}")
        print(f"Found: {len(lessons)} lessons")

    # Process videos
    course_dir = target_base / course_name
    course_dir.mkdir(parents=True, exist_ok=True)

    for lesson in lessons:
        if lesson["status"] == "done":
            print(f"[skip] {lesson['idx']}: {lesson['title']} (already done)")
            continue

        video_url = lesson.get("videoUrl")
        if not video_url:
            print(f"[skip] {lesson['idx']}: {lesson['title']} (no video URL)")
            lesson["status"] = "skipped"
            continue

        print(f"\\n[processing] {lesson['idx']}: {lesson['title']}")

        # Update status to processing
        lesson["status"] = "processing"
        save_progress(progress_file, progress)

        # Process the video
        safe_title = sanitize_filename(lesson["title"])
        filename_prefix = f"{lesson['idx']}-{safe_title}"

        result = process_video(video_url, skill_dir, course_dir, filename_prefix)

        if result:
            # Use content-summarizer skill to create final output
            try:
                # For now, create a simple markdown file
                # TODO: Integrate with content-summarizer skill

                output_content = f"""---
tags: [finetuning, llm, deeplearning-ai]
source: {result['source_url']}
---

# {lesson['title']}

**Course**: {progress['courseName']}
**Lesson**: {lesson['idx']}
**Source**: {result['source_url']}

## Metadata

- **Title**: {result['metadata'].get('title', 'N/A')}
- **Channel**: {result['metadata'].get('uploader', 'N/A')}
- **Duration**: {result['metadata'].get('duration_string', 'N/A')}
- **Upload Date**: {result['metadata'].get('upload_date', 'N/A')}

## Transcript

{result['transcript'] if result['transcript'] else 'Transcript not available'}
"""

                with open(result['output_file'], 'w', encoding='utf-8') as f:
                    f.write(output_content)

                lesson["status"] = "done"
                lesson["outputFile"] = str(result['output_file'])
                lesson["processedAt"] = datetime.datetime.utcnow().isoformat() + "Z"

                print(f"[done] Saved: {result['output_file']}")

            except Exception as e:
                print(f"[error] Failed to save output: {e}")
                lesson["status"] = "failed"

        else:
            lesson["status"] = "failed"

        # Save progress after each lesson
        save_progress(progress_file, progress)

    # Final summary
    done_count = sum(1 for l in lessons if l["status"] == "done")
    failed_count = sum(1 for l in lessons if l["status"] == "failed")
    skipped_count = sum(1 for l in lessons if l["status"] == "skipped")

    print(f"\\n=== SUMMARY ===")
    print(f"Total: {len(lessons)}")
    print(f"Done: {done_count}")
    print(f"Failed: {failed_count}")
    print(f"Skipped: {skipped_count}")
    print(f"Output directory: {course_dir}")

    return 0

if __name__ == "__main__":
    sys.exit(main())