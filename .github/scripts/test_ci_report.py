import copy
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from ci_report import REQUIRED, report


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.needs = {key: {"result": "success"} for key in REQUIRED}
        self.needs["changes"]["outputs"] = {"android": "false", "ios": "false"}

    def test_all_required_checks_must_pass(self):
        self.assertTrue(report(self.needs)[1])
        for key in REQUIRED:
            for result in ("failure", "cancelled", "skipped"):
                with self.subTest(job=key, result=result):
                    needs = copy.deepcopy(self.needs)
                    needs[key]["result"] = result
                    markdown, passed = report(needs)
                    self.assertFalse(passed)
                    self.assertIn("publicação bloqueada", markdown)

    def test_missing_results_block_publication(self):
        self.assertFalse(report({})[1])
        for key in REQUIRED:
            needs = copy.deepcopy(self.needs)
            del needs[key]
            self.assertFalse(report(needs)[1])

    def test_mobile_checks_are_required_when_changes_need_them(self):
        for platform in ("android", "ios"):
            needs = copy.deepcopy(self.needs)
            needs["changes"]["outputs"][platform] = "true"
            self.assertFalse(report(needs)[1])
            needs[f"{platform}-check"] = {"result": "success"}
            self.assertTrue(report(needs)[1])

    def test_cli_writes_report_even_on_failure(self):
        script = str(Path(__file__).with_name("ci_report.py").resolve())
        for payload, expected_code in ((self.needs, 0), ({}, 1), ([], 1)):
            with tempfile.TemporaryDirectory() as directory:
                summary = Path(directory) / "summary.md"
                result = subprocess.run(
                    [sys.executable, script], cwd=directory, capture_output=True,
                    env={**os.environ, "CI_NEEDS_JSON": json.dumps(payload),
                         "GITHUB_STEP_SUMMARY": str(summary)},
                )
                self.assertEqual(result.returncode, expected_code, result.stderr)
                self.assertEqual(summary.read_text(encoding="utf-8"),
                                 (Path(directory) / "reports/ci-summary.md").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
