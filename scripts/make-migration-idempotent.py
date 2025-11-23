#!/usr/bin/env python3
"""
Make the fresh migration idempotent by wrapping all CREATE statements in DO blocks
"""
import re
from pathlib import Path

migration_file = Path("c:/Users/User/taxhub003/prisma/migrations/20251123231126_init/migration.sql")

print(f"📄 Reading fresh migration file...")
content = migration_file.read_text(encoding='utf-8')

# Count statements before
create_tables = len(re.findall(r'^CREATE TABLE', content, re.MULTILINE))
create_indexes = len(re.findall(r'^CREATE (?:UNIQUE )?INDEX', content, re.MULTILINE))
create_types = len(re.findall(r'^CREATE TYPE', content, re.MULTILINE))

print(f"📊 Found:")
print(f"   - {create_tables} CREATE TABLE statements")
print(f"   - {create_indexes} CREATE INDEX statements")  
print(f"   - {create_types} CREATE TYPE statements")

# Fix CREATE TYPE statements (use duplicate_object)
content = re.sub(
    r'(CREATE TYPE "[^"]+" AS ENUM \([^)]+\);)',
    r'DO $$ BEGIN\n    \1\nEXCEPTION\n    WHEN duplicate_object THEN null;\nEND $$;',
    content
)

# Fix CREATE TABLE statements (use duplicate_table)
content = re.sub(
    r'(CREATE TABLE "[^"]+"[^;]+;)',
    r'DO $$ BEGIN\n    \1\nEXCEPTION\n    WHEN duplicate_table THEN null;\nEND $$;',
    content,
    flags=re.DOTALL
)

# Fix CREATE INDEX statements (use duplicate_table)
content = re.sub(
    r'(CREATE (?:UNIQUE )?INDEX "[^"]+" ON "[^"]+"\([^)]+\);)',
    r'DO $$ BEGIN\n    \1\nEXCEPTION\n    WHEN duplicate_table THEN null;\nEND $$;',
    content
)

# Fix ALTER TABLE ADD CONSTRAINT (foreign keys - use duplicate_object)
content = re.sub(
    r'(ALTER TABLE "[^"]+" ADD CONSTRAINT "[^"]+" FOREIGN KEY[^;]+;)',
    r'DO $$ BEGIN\n    \1\nEXCEPTION\n    WHEN duplicate_object THEN null;\nEND $$;',
    content
)

print(f"\n💾 Writing idempotent migration...")
migration_file.write_text(content, encoding='utf-8')

print(f"🎉 Migration is now fully idempotent!")
print(f"✅ Safe to run multiple times without errors")
