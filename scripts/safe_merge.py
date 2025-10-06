#!/usr/bin/env python3
"""
Safe Merge Tool for Axpect SMS
Performs safe integration of external repositories
"""

import os
import sys
import shutil
import subprocess
import json
from pathlib import Path
from datetime import datetime
import tempfile

class SafeMerger:
    def __init__(self, current_path=".", external_path=None, merge_config=None):
        self.current_path = Path(current_path)
        self.external_path = Path(external_path) if external_path else None
        self.merge_config = merge_config or {}
        self.backup_path = None
        self.merge_log = []
        
    def log_action(self, action, status="INFO", details=""):
        """Log merge actions"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "action": action,
            "status": status,
            "details": details
        }
        self.merge_log.append(log_entry)
        print(f"[{timestamp}] {status}: {action}")
        if details:
            print(f"    {details}")
    
    def create_backup(self):
        """Create full backup before merge"""
        self.log_action("Creating backup", "INFO")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"pre_merge_backup_{timestamp}"
        self.backup_path = self.current_path.parent / backup_name
        
        try:
            # Create backup directory
            self.backup_path.mkdir(exist_ok=True)
            
            # Copy current codebase
            shutil.copytree(
                self.current_path, 
                self.backup_path / "codebase",
                ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '.git', 'venv', 'node_modules')
            )
            
            # Backup database if SQLite
            db_file = self.current_path / "db.sqlite3"
            if db_file.exists():
                shutil.copy2(db_file, self.backup_path / "db.sqlite3")
            
            # Create backup info
            backup_info = {
                "timestamp": timestamp,
                "backup_path": str(self.backup_path),
                "original_path": str(self.current_path),
                "external_path": str(self.external_path) if self.external_path else None
            }
            
            with open(self.backup_path / "backup_info.json", 'w') as f:
                json.dump(backup_info, f, indent=2)
            
            self.log_action("Backup created successfully", "SUCCESS", str(self.backup_path))
            return True
            
        except Exception as e:
            self.log_action("Backup creation failed", "ERROR", str(e))
            return False
    
    def create_merge_branch(self):
        """Create Git branch for merge"""
        try:
            # Check if we're in a git repository
            result = subprocess.run(['git', 'status'], 
                                  capture_output=True, text=True, cwd=self.current_path)
            
            if result.returncode == 0:
                # Create merge branch
                branch_name = f"merge-external-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
                subprocess.run(['git', 'checkout', '-b', branch_name], 
                             cwd=self.current_path, check=True)
                
                self.log_action(f"Created merge branch: {branch_name}", "SUCCESS")
                return branch_name
            else:
                self.log_action("Not a git repository, skipping branch creation", "WARNING")
                return None
                
        except subprocess.CalledProcessError as e:
            self.log_action("Failed to create merge branch", "ERROR", str(e))
            return None
    
    def merge_django_app(self, app_path, target_name=None):
        """Merge a Django app from external repository"""
        app_path = Path(app_path)
        if not app_path.exists():
            self.log_action(f"App path not found: {app_path}", "ERROR")
            return False
        
        target_name = target_name or app_path.name
        target_path = self.current_path / target_name
        
        try:
            # Check if target already exists
            if target_path.exists():
                self.log_action(f"Target app already exists: {target_name}", "WARNING")
                # Create backup of existing app
                backup_target = self.current_path / f"{target_name}_backup_{datetime.now().strftime('%H%M%S')}"
                shutil.move(target_path, backup_target)
                self.log_action(f"Backed up existing app to: {backup_target}", "INFO")
            
            # Copy the app
            shutil.copytree(app_path, target_path)
            self.log_action(f"Copied app: {app_path} -> {target_path}", "SUCCESS")
            
            # Update app configuration if needed
            self.update_app_config(target_path, target_name)
            
            return True
            
        except Exception as e:
            self.log_action(f"Failed to merge app: {app_path}", "ERROR", str(e))
            return False
    
    def update_app_config(self, app_path, app_name):
        """Update app configuration files"""
        apps_py = app_path / "apps.py"
        
        if apps_py.exists():
            try:
                with open(apps_py, 'r') as f:
                    content = f.read()
                
                # Update app name in apps.py
                content = content.replace(
                    f"name = '{app_path.name}'",
                    f"name = '{app_name}'"
                )
                
                with open(apps_py, 'w') as f:
                    f.write(content)
                
                self.log_action(f"Updated apps.py for {app_name}", "SUCCESS")
                
            except Exception as e:
                self.log_action(f"Failed to update apps.py for {app_name}", "ERROR", str(e))
    
    def merge_requirements(self, external_requirements_path):
        """Merge requirements.txt files"""
        external_req = Path(external_requirements_path)
        current_req = self.current_path / "requirements.txt"
        
        if not external_req.exists():
            self.log_action("External requirements.txt not found", "WARNING")
            return True
        
        try:
            # Read current requirements
            current_deps = set()
            if current_req.exists():
                with open(current_req, 'r') as f:
                    current_deps = set(line.strip() for line in f if line.strip() and not line.startswith('#'))
            
            # Read external requirements
            with open(external_req, 'r') as f:
                external_deps = set(line.strip() for line in f if line.strip() and not line.startswith('#'))
            
            # Merge requirements
            merged_deps = current_deps.union(external_deps)
            
            # Write merged requirements
            with open(current_req, 'w') as f:
                f.write("# Merged requirements\n")
                for dep in sorted(merged_deps):
                    f.write(f"{dep}\n")
            
            self.log_action("Requirements merged successfully", "SUCCESS")
            return True
            
        except Exception as e:
            self.log_action("Failed to merge requirements", "ERROR", str(e))
            return False
    
    def update_settings(self, new_apps=None):
        """Update Django settings with new apps"""
        settings_path = self.current_path / "axpect_tech_config" / "settings.py"
        
        if not settings_path.exists():
            self.log_action("Settings file not found", "ERROR")
            return False
        
        if not new_apps:
            return True
        
        try:
            with open(settings_path, 'r') as f:
                content = f.read()
            
            # Find INSTALLED_APPS
            import re
            pattern = r"INSTALLED_APPS\s*=\s*\[(.*?)\]"
            match = re.search(pattern, content, re.DOTALL)
            
            if match:
                apps_content = match.group(1)
                
                # Add new apps
                for app in new_apps:
                    if f"'{app}'" not in apps_content:
                        apps_content += f"\n    '{app}',"
                
                # Replace in content
                new_installed_apps = f"INSTALLED_APPS = [{apps_content}\n]"
                content = re.sub(pattern, new_installed_apps, content, flags=re.DOTALL)
                
                # Write back
                with open(settings_path, 'w') as f:
                    f.write(content)
                
                self.log_action(f"Added apps to settings: {new_apps}", "SUCCESS")
                return True
            else:
                self.log_action("Could not find INSTALLED_APPS in settings", "ERROR")
                return False
                
        except Exception as e:
            self.log_action("Failed to update settings", "ERROR", str(e))
            return False
    
    def run_tests(self):
        """Run Django tests to verify merge"""
        self.log_action("Running Django tests", "INFO")
        
        try:
            result = subprocess.run(
                [sys.executable, 'manage.py', 'test', '--verbosity=2'],
                cwd=self.current_path,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes timeout
            )
            
            if result.returncode == 0:
                self.log_action("All tests passed", "SUCCESS")
                return True
            else:
                self.log_action("Tests failed", "ERROR", result.stderr)
                return False
                
        except subprocess.TimeoutExpired:
            self.log_action("Tests timed out", "ERROR")
            return False
        except Exception as e:
            self.log_action("Failed to run tests", "ERROR", str(e))
            return False
    
    def run_health_check(self):
        """Run system health check"""
        self.log_action("Running health check", "INFO")
        
        try:
            result = subprocess.run(
                [sys.executable, 'manage.py', 'health_check'],
                cwd=self.current_path,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                self.log_action("Health check passed", "SUCCESS")
                return True
            else:
                self.log_action("Health check failed", "ERROR", result.stderr)
                return False
                
        except Exception as e:
            self.log_action("Failed to run health check", "ERROR", str(e))
            return False
    
    def rollback(self):
        """Rollback merge if something goes wrong"""
        if not self.backup_path or not self.backup_path.exists():
            self.log_action("No backup found for rollback", "ERROR")
            return False
        
        try:
            self.log_action("Starting rollback", "WARNING")
            
            # Remove current files (except .git)
            for item in self.current_path.iterdir():
                if item.name != '.git':
                    if item.is_dir():
                        shutil.rmtree(item)
                    else:
                        item.unlink()
            
            # Restore from backup
            backup_codebase = self.backup_path / "codebase"
            for item in backup_codebase.iterdir():
                if item.is_dir():
                    shutil.copytree(item, self.current_path / item.name)
                else:
                    shutil.copy2(item, self.current_path / item.name)
            
            # Restore database if exists
            backup_db = self.backup_path / "db.sqlite3"
            if backup_db.exists():
                shutil.copy2(backup_db, self.current_path / "db.sqlite3")
            
            self.log_action("Rollback completed successfully", "SUCCESS")
            return True
            
        except Exception as e:
            self.log_action("Rollback failed", "ERROR", str(e))
            return False
    
    def save_merge_log(self):
        """Save merge log to file"""
        log_file = self.current_path / f"merge_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            with open(log_file, 'w') as f:
                json.dump(self.merge_log, f, indent=2)
            
            print(f"📝 Merge log saved to: {log_file}")
            
        except Exception as e:
            print(f"Failed to save merge log: {e}")
    
    def perform_merge(self, merge_plan):
        """Execute the merge plan"""
        print("🚀 Starting safe merge process...")
        
        # Step 1: Create backup
        if not self.create_backup():
            print("❌ Backup creation failed. Aborting merge.")
            return False
        
        # Step 2: Create merge branch
        branch_name = self.create_merge_branch()
        
        success = True
        
        try:
            # Step 3: Execute merge plan
            for step in merge_plan:
                if step["type"] == "copy_app":
                    success = self.merge_django_app(step["source"], step.get("target"))
                elif step["type"] == "merge_requirements":
                    success = self.merge_requirements(step["source"])
                elif step["type"] == "update_settings":
                    success = self.update_settings(step.get("new_apps"))
                
                if not success:
                    break
            
            if success:
                # Step 4: Run tests
                success = self.run_tests()
            
            if success:
                # Step 5: Run health check
                success = self.run_health_check()
            
            if success:
                self.log_action("Merge completed successfully", "SUCCESS")
                print("✅ Merge completed successfully!")
                print("📋 Next steps:")
                print("1. Review the changes")
                print("2. Test the application thoroughly")
                print("3. Update documentation")
                print("4. Deploy to staging for testing")
            else:
                print("❌ Merge failed. Starting rollback...")
                self.rollback()
                
        except Exception as e:
            self.log_action("Unexpected error during merge", "ERROR", str(e))
            print("❌ Unexpected error. Starting rollback...")
            self.rollback()
            success = False
        
        finally:
            self.save_merge_log()
        
        return success

def main():
    if len(sys.argv) < 3:
        print("Usage: python safe_merge.py <external_repo_path> <merge_plan.json>")
        sys.exit(1)
    
    external_repo = sys.argv[1]
    merge_plan_file = sys.argv[2]
    
    # Load merge plan
    try:
        with open(merge_plan_file, 'r') as f:
            merge_plan = json.load(f)
    except Exception as e:
        print(f"Failed to load merge plan: {e}")
        sys.exit(1)
    
    # Perform merge
    merger = SafeMerger(external_path=external_repo)
    success = merger.perform_merge(merge_plan)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
