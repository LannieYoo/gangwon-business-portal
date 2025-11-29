"""
Run unit tests with coverage report.

Usage:
    python tests/run_unit_tests.py
    python tests/run_unit_tests.py --coverage
    python tests/run_unit_tests.py --verbose
"""
import sys
import subprocess
import os

def main():
    """Run unit tests."""
    # Get script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(script_dir)
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Set coverage data file location to tests directory
    coverage_file = os.path.join(backend_dir, "tests", ".coverage")
    os.environ["COVERAGE_FILE"] = coverage_file
    
    # Build pytest command
    cmd = [
        sys.executable, "-m", "pytest",
        "-c", "tests/pytest.ini",  # Use pytest.ini from tests directory
        "tests/unit/",
        "-v",
        "--tb=short",
        "-m", "unit",  # Only run unit tests
    ]
    
    # Add coverage if requested
    if "--coverage" in sys.argv:
        cmd.extend([
            "--cov=src",
            "--cov-report=term-missing",
            "--cov-report=html:tests/htmlcov",
            "--cov-report=json:tests/coverage.json",
            "--cov-report=xml:tests/coverage.xml",
            "--cov-fail-under=70",
        ])
    
    # Add verbose flag
    if "--verbose" in sys.argv or "-v" in sys.argv:
        cmd.append("-vv")
    
    print("=" * 70)
    print("Running Unit Tests")
    print("=" * 70)
    print(f"Command: {' '.join(cmd)}")
    print("=" * 70)
    
    # Run tests
    result = subprocess.run(cmd)
    
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()

