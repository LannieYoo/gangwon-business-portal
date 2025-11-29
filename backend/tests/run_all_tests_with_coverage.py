"""
Run all tests (unit + integration) with coverage report.

Usage:
    python tests/run_all_tests_with_coverage.py
    python tests/run_all_tests_with_coverage.py --unit-only
    python tests/run_all_tests_with_coverage.py --integration-only
"""
import sys
import subprocess
import os

def main():
    """Run all tests with coverage."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)
    os.chdir(backend_dir)
    
    # Set coverage data file location to tests directory
    coverage_file = os.path.join(backend_dir, "tests", ".coverage")
    os.environ["COVERAGE_FILE"] = coverage_file
    
    # Build pytest command
    cmd = [
        sys.executable, "-m", "pytest",
        "-c", "tests/pytest.ini",  # Use pytest.ini from tests directory
        "-v",
        "--tb=short",
        "--cov=src",
        "--cov-report=term-missing",
        "--cov-report=html:tests/htmlcov",
        "--cov-report=json:tests/coverage.json",
        "--cov-report=xml:tests/coverage.xml",
        "--cov-fail-under=70",
    ]
    
    # Add test paths based on arguments
    if "--unit-only" in sys.argv:
        cmd.append("tests/unit/")
        cmd.extend(["-m", "unit"])
    elif "--integration-only" in sys.argv:
        cmd.append("tests/integration/")
        cmd.extend(["-m", "integration"])
    else:
        # Run both unit and integration tests
        cmd.extend(["tests/unit/", "tests/integration/"])
    
    print("=" * 70)
    print("Running Tests with Coverage")
    print("=" * 70)
    print(f"Command: {' '.join(cmd)}")
    print("=" * 70)
    
    result = subprocess.run(cmd)
    
    if result.returncode == 0:
        print("\n" + "=" * 70)
        print("✅ All tests passed!")
        print("📊 Coverage report generated:")
        print("   - HTML: tests/htmlcov/index.html")
        print("   - JSON: tests/coverage.json")
        print("   - XML:  tests/coverage.xml")
        print("=" * 70)
    else:
        print("\n" + "=" * 70)
        print("❌ Some tests failed. Check output above.")
        print("=" * 70)
    
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()

