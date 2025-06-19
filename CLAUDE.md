# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm install` - Install Node.js dependencies
- `composer install --dev` - Install PHP dependencies with dev dependencies
- `grunt` - Run default build tasks (CSS, JS compilation)
- `grunt css` - Build CSS from SCSS files
- `grunt js` - Process JavaScript files
- `grunt watch` - Watch for file changes during development

### Code Quality
- `grunt eslint` - Lint JavaScript code
- `grunt stylelint` - Lint CSS/SCSS code
- `vendor/bin/phpcs` - Run PHP CodeSniffer (after composer install)

### Testing
- `vendor/bin/phpunit path/to/test.php` - Run specific PHPUnit test
- `vendor/bin/phpunit` - Run all unit tests
- Behat tests require additional setup (see behat.yml.dist)

## Architecture Overview

### Plugin System
Moodle uses a modular plugin architecture. Plugin types include:
- `/mod/*` - Activity modules (forum, quiz, assignment)
- `/auth/*` - Authentication methods
- `/blocks/*` - UI blocks
- `/enrol/*` - Enrollment methods
- `/theme/*` - Themes

Each plugin follows the naming convention `{type}_{name}` and has specific interface requirements.

### Core Components
- `/lib` - Core libraries and base classes
- `/lang` - Language strings (use get_string() function)
- `/templates` - Mustache templates for rendering
- Database access via global `$DB` object
- User context via global `$USER` object
- Page rendering via global `$PAGE` and `$OUTPUT` objects

### Key Patterns
- **Database**: Uses XMLDB for schema management. All queries go through `$DB` global.
- **Rendering**: Mustache templates in `templates/` directories, renderer classes for output
- **Permissions**: Capability-based access control system
- **Events**: Event-driven architecture for hooking into system actions
- **Web Services**: External functions in `externallib.php` files

### File Structure for New Features
When adding new functionality:
1. Module plugins go in `/mod/{modulename}/`
2. Each plugin needs `version.php`, `db/` directory, and language files
3. Database changes go in `db/install.xml` or `db/upgrade.php`
4. External APIs in `externallib.php` with service definitions in `db/services.php`
5. Templates in `templates/` with matching renderer methods

### Development Requirements
- PHP 8.2+ with extensions: gd, intl, xmlrpc, soap, zip, mbstring
- Node.js 22.11.0+
- Composer for PHP dependencies
- Database: MySQL 8.0+, MariaDB 10.4+, PostgreSQL 13+, or MSSQL 2017+