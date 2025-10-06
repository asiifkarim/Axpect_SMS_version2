#!/usr/bin/env python3
"""
Merge Analyzer Tool for Axpect SMS
Analyzes external repositories for safe integration
"""

import os
import sys
import json
import difflib
import subprocess
from pathlib import Path
from collections import defaultdict
import ast
import re

class MergeAnalyzer:
    def __init__(self, current_path=".", external_path=None):
        self.current_path = Path(current_path)
        self.external_path = Path(external_path) if external_path else None
        self.analysis_report = {
            "file_conflicts": [],
            "dependency_conflicts": [],
            "model_conflicts": [],
            "url_conflicts": [],
            "settings_conflicts": [],
            "migration_analysis": {},
            "recommendations": []
        }
    
    def analyze_repository(self, repo_path):
        """Analyze repository structure and components"""
        repo_path = Path(repo_path)
        
        analysis = {
            "django_apps": [],
            "models": [],
            "views": [],
            "urls": [],
            "requirements": [],
            "migrations": [],
            "static_files": [],
            "templates": [],
            "management_commands": []
        }
        
        # Find Django apps
        for item in repo_path.rglob("apps.py"):
            app_dir = item.parent
            analysis["django_apps"].append(str(app_dir.relative_to(repo_path)))
        
        # Find models
        for item in repo_path.rglob("models.py"):
            models = self.extract_models(item)
            analysis["models"].extend(models)
        
        # Find views
        for item in repo_path.rglob("views.py"):
            analysis["views"].append(str(item.relative_to(repo_path)))
        
        # Find URLs
        for item in repo_path.rglob("urls.py"):
            analysis["urls"].append(str(item.relative_to(repo_path)))
        
        # Find requirements
        for item in repo_path.rglob("requirements*.txt"):
            deps = self.parse_requirements(item)
            analysis["requirements"].extend(deps)
        
        # Find migrations
        for item in repo_path.rglob("migrations"):
            if item.is_dir():
                migrations = list(item.glob("*.py"))
                analysis["migrations"].extend([str(m.relative_to(repo_path)) for m in migrations])
        
        # Find static files
        for item in repo_path.rglob("static"):
            if item.is_dir():
                static_files = list(item.rglob("*"))
                analysis["static_files"].extend([str(f.relative_to(repo_path)) for f in static_files if f.is_file()])
        
        # Find templates
        for item in repo_path.rglob("templates"):
            if item.is_dir():
                templates = list(item.rglob("*.html"))
                analysis["templates"].extend([str(t.relative_to(repo_path)) for t in templates])
        
        # Find management commands
        for item in repo_path.rglob("management/commands"):
            if item.is_dir():
                commands = list(item.glob("*.py"))
                analysis["management_commands"].extend([str(c.relative_to(repo_path)) for c in commands])
        
        return analysis
    
    def extract_models(self, models_file):
        """Extract Django model names from models.py"""
        models = []
        try:
            with open(models_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    # Check if it's a Django model
                    for base in node.bases:
                        if isinstance(base, ast.Attribute) and base.attr == 'Model':
                            models.append({
                                "name": node.name,
                                "file": str(models_file),
                                "line": node.lineno
                            })
                        elif isinstance(base, ast.Name) and base.id == 'Model':
                            models.append({
                                "name": node.name,
                                "file": str(models_file),
                                "line": node.lineno
                            })
        except Exception as e:
            print(f"Error parsing {models_file}: {e}")
        
        return models
    
    def parse_requirements(self, req_file):
        """Parse requirements.txt file"""
        requirements = []
        try:
            with open(req_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        # Parse package name and version
                        match = re.match(r'^([a-zA-Z0-9_-]+)([>=<!=]+.*)?', line)
                        if match:
                            package = match.group(1)
                            version = match.group(2) if match.group(2) else ""
                            requirements.append({
                                "package": package,
                                "version": version,
                                "line": line
                            })
        except Exception as e:
            print(f"Error parsing {req_file}: {e}")
        
        return requirements
    
    def compare_repositories(self):
        """Compare current repository with external repository"""
        if not self.external_path or not self.external_path.exists():
            print("External repository path not provided or doesn't exist")
            return
        
        print("🔍 Analyzing repositories...")
        
        current_analysis = self.analyze_repository(self.current_path)
        external_analysis = self.analyze_repository(self.external_path)
        
        # Check file conflicts
        self.check_file_conflicts(current_analysis, external_analysis)
        
        # Check dependency conflicts
        self.check_dependency_conflicts(current_analysis, external_analysis)
        
        # Check model conflicts
        self.check_model_conflicts(current_analysis, external_analysis)
        
        # Check URL conflicts
        self.check_url_conflicts()
        
        # Generate recommendations
        self.generate_recommendations()
        
        return self.analysis_report
    
    def check_file_conflicts(self, current, external):
        """Check for conflicting file names"""
        current_files = set()
        external_files = set()
        
        # Collect all Python files
        for item in self.current_path.rglob("*.py"):
            current_files.add(item.name)
        
        for item in self.external_path.rglob("*.py"):
            external_files.add(item.name)
        
        conflicts = current_files.intersection(external_files)
        
        for conflict in conflicts:
            self.analysis_report["file_conflicts"].append({
                "file": conflict,
                "type": "filename_conflict",
                "severity": "medium"
            })
    
    def check_dependency_conflicts(self, current, external):
        """Check for dependency version conflicts"""
        current_deps = {dep["package"]: dep for dep in current["requirements"]}
        external_deps = {dep["package"]: dep for dep in external["requirements"]}
        
        common_packages = set(current_deps.keys()).intersection(set(external_deps.keys()))
        
        for package in common_packages:
            current_version = current_deps[package]["version"]
            external_version = external_deps[package]["version"]
            
            if current_version != external_version:
                self.analysis_report["dependency_conflicts"].append({
                    "package": package,
                    "current_version": current_version,
                    "external_version": external_version,
                    "severity": "high" if package.lower() == "django" else "medium"
                })
    
    def check_model_conflicts(self, current, external):
        """Check for Django model conflicts"""
        current_models = {model["name"]: model for model in current["models"]}
        external_models = {model["name"]: model for model in external["models"]}
        
        common_models = set(current_models.keys()).intersection(set(external_models.keys()))
        
        for model in common_models:
            self.analysis_report["model_conflicts"].append({
                "model": model,
                "current_file": current_models[model]["file"],
                "external_file": external_models[model]["file"],
                "severity": "high"
            })
    
    def check_url_conflicts(self):
        """Check for URL pattern conflicts"""
        # This is a simplified check - in practice, you'd parse urls.py files
        current_urls = list(self.current_path.rglob("urls.py"))
        external_urls = list(self.external_path.rglob("urls.py"))
        
        if current_urls and external_urls:
            self.analysis_report["url_conflicts"].append({
                "message": "URL patterns need manual review",
                "current_files": [str(f) for f in current_urls],
                "external_files": [str(f) for f in external_urls],
                "severity": "medium"
            })
    
    def generate_recommendations(self):
        """Generate merge recommendations based on analysis"""
        recommendations = []
        
        # File conflicts
        if self.analysis_report["file_conflicts"]:
            recommendations.append({
                "type": "file_conflicts",
                "message": f"Found {len(self.analysis_report['file_conflicts'])} file name conflicts",
                "action": "Rename conflicting files or merge content carefully"
            })
        
        # Dependency conflicts
        if self.analysis_report["dependency_conflicts"]:
            high_severity = [c for c in self.analysis_report["dependency_conflicts"] if c["severity"] == "high"]
            if high_severity:
                recommendations.append({
                    "type": "critical_dependencies",
                    "message": f"Critical dependency conflicts found: {[c['package'] for c in high_severity]}",
                    "action": "Resolve version conflicts before merging"
                })
        
        # Model conflicts
        if self.analysis_report["model_conflicts"]:
            recommendations.append({
                "type": "model_conflicts",
                "message": f"Found {len(self.analysis_report['model_conflicts'])} model name conflicts",
                "action": "Rename models or create bridge models"
            })
        
        # General recommendations
        recommendations.extend([
            {
                "type": "backup",
                "message": "Create full backup before merging",
                "action": "Run ./scripts/backup.sh"
            },
            {
                "type": "testing",
                "message": "Set up comprehensive testing",
                "action": "Create merge branch and test thoroughly"
            },
            {
                "type": "monitoring",
                "message": "Monitor system during merge",
                "action": "Watch Grafana dashboards and health checks"
            }
        ])
        
        self.analysis_report["recommendations"] = recommendations
    
    def generate_report(self, output_file="merge_analysis_report.json"):
        """Generate detailed analysis report"""
        with open(output_file, 'w') as f:
            json.dump(self.analysis_report, f, indent=2)
        
        print(f"📊 Analysis report saved to {output_file}")
        
        # Print summary
        print("\n" + "="*60)
        print("🔍 MERGE ANALYSIS SUMMARY")
        print("="*60)
        
        print(f"File Conflicts: {len(self.analysis_report['file_conflicts'])}")
        print(f"Dependency Conflicts: {len(self.analysis_report['dependency_conflicts'])}")
        print(f"Model Conflicts: {len(self.analysis_report['model_conflicts'])}")
        print(f"URL Conflicts: {len(self.analysis_report['url_conflicts'])}")
        
        print("\n📋 RECOMMENDATIONS:")
        for i, rec in enumerate(self.analysis_report["recommendations"], 1):
            print(f"{i}. {rec['message']}")
            print(f"   Action: {rec['action']}")
        
        # Show critical issues
        critical_issues = []
        critical_issues.extend([c for c in self.analysis_report["dependency_conflicts"] if c["severity"] == "high"])
        critical_issues.extend(self.analysis_report["model_conflicts"])
        
        if critical_issues:
            print("\n🚨 CRITICAL ISSUES REQUIRING ATTENTION:")
            for issue in critical_issues:
                if "package" in issue:
                    print(f"   - Dependency conflict: {issue['package']}")
                elif "model" in issue:
                    print(f"   - Model conflict: {issue['model']}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python merge_analyzer.py <external_repo_path>")
        sys.exit(1)
    
    external_repo = sys.argv[1]
    
    analyzer = MergeAnalyzer(external_path=external_repo)
    analyzer.compare_repositories()
    analyzer.generate_report()

if __name__ == "__main__":
    main()
