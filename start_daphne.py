#!/usr/bin/env python
"""
Production-ready Daphne server startup script with optimizations
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'axpect_tech_config.settings')
    
    # Setup Django
    django.setup()
    
    # Import after Django setup
    from daphne.cli import CommandLineInterface
    
    # Daphne configuration for production
    sys.argv = [
        'daphne',
        '-b', '0.0.0.0',
        '-p', '8000',
        '--access-log', '/app/logs/daphne_access.log',
        '--proxy-headers',
        '--root-path', '/app',
        'axpect_tech_config.asgi:application'
    ]
    
    # Start Daphne
    CommandLineInterface.entrypoint()
