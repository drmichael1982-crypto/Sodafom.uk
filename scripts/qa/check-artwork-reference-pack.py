#!/usr/bin/env python3
"""Check the exact private reference pack accompanying artwork handoff #33.

Requires Python 3 and Pillow. Reads the extracted pack without changing it.
Integrity success is not character-likeness, animation or release approval.
"""

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def check_pack(root):
    # These are the two authoritative source identities from handoff #33.
    anchors = {
        "images/master/michael-davis-approved.jpg":
            "74e4bc78fddea3ca40bc8bbb383a8b6c8a344178e27d9a2591d88e810dedefa2",
        "images/master/approved-group-rocket.png":
            "aaef7bb409f6a35a40029bdb518a92f511511f5908c84ce00ac07f0f54dc6099",
    }
    manifest_bytes = (root / "scene-status.json").read_bytes()
    if sha256(manifest_bytes) != "9d0613e9fa38b5cdf1b80f02f9c7b66fb1b3369e344b5d7cf7f049cd6e46d76d":
        raise ValueError("Manifest differs from the exact handoff #33 pack")
    manifest = json.loads(manifest_bytes)
    assets = manifest["assets"]
    paths = [asset["path"] for asset in assets]
    if len(paths) != 9 or len(set(paths)) != 9:
        raise ValueError("Expected the nine distinct image assets supplied with #33")
    if not set(anchors).issubset(paths):
        raise ValueError("Both approved master references must be present")

    results = []
    for asset in assets:
        relative = asset["path"]
        entry = {"path": relative}
        try:
            path = (root / relative).resolve()
            if not path.is_relative_to(root):
                raise ValueError("Asset path leaves the supplied reference pack")
            data = path.read_bytes()
            actual_hash = sha256(data)
            with Image.open(path) as img:
                width, height = img.size
                img.load()
            checks = {
                "sha256": actual_hash == asset["sha256"],
                "bytes": len(data) == asset["bytes"],
                "dimensions": (width, height) == (asset["width"], asset["height"]),
                "decodes": True,
            }
            if relative in anchors:
                checks["approvedMasterHash"] = actual_hash == anchors[relative]
            entry.update(sha256=actual_hash, bytes=len(data), width=width,
                         height=height, checks=checks,
                         status="PASS" if all(checks.values()) else "FAIL")
        except (OSError, ValueError, Image.DecompressionBombError) as error:
            entry.update(status="FAIL", error=type(error).__name__)
        results.append(entry)

    return {
        "handoffCommit": "cbe4a727b2edd561fcc29d024844ca920904e1dc",
        "scope": "Reference integrity only; no visual, motion, voice or app approval",
        "status": "PASS" if all(x["status"] == "PASS" for x in results) else "FAIL",
        "passed": sum(x["status"] == "PASS" for x in results),
        "total": len(results),
        "assets": results,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pack_directory", type=Path,
                        help="Extracted sodafom-artwork-master-20260916 directory")
    args = parser.parse_args()
    try:
        result = check_pack(args.pack_directory.resolve())
    except (OSError, ValueError, KeyError, TypeError) as error:
        result = {"status": "FAIL", "error": type(error).__name__}
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["status"] == "PASS" else 1)
