# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment Setup

### Requirements
- PHP 8.2+ with required extensions: gd, intl, xmlrpc, soap, zip, mbstring, curl, openssl
- Optional PHP extensions: opcache (performance), ldap (LDAP auth), sodium (crypto)
- Node.js 22.11.0+ for frontend tooling
- Composer 2.7.0+ for PHP dependencies
- Database: MySQL 8.0+, MariaDB 10.4+, PostgreSQL 13+, or MSSQL 2017+

### Initial Setup
```bash
composer install --prefer-dist --no-dev  # Production
composer install --dev                   # Development
npm install                             # Install Node dependencies
grunt                                   # Build CSS/JS assets
```

## Development Commands

### Build Tasks
- `grunt` - Run default build tasks (amd, yui, css)
- `grunt amd` - Compile AMD JavaScript modules
- `grunt yui` - Compile YUI modules (legacy)
- `grunt css` - Compile SCSS to CSS
- `grunt js` - Build all JavaScript (amd + yui)
- `grunt watch` - Watch for file changes
- `grunt shifter` - Build YUI modules using Shifter
- `grunt eslint --show-lint-warnings` - Lint JavaScript with warnings

### Code Quality
- `grunt eslint` - Lint JavaScript code
- `grunt stylelint` - Lint CSS/SCSS files   
- `vendor/bin/phpcs` - PHP CodeSniffer
- `vendor/bin/phpcbf` - PHP Code Beautifier (auto-fix)

### Testing
- `vendor/bin/phpunit path/to/test.php` - Run specific test
- `vendor/bin/phpunit --testsuite core_testsuite` - Run core tests
- `vendor/bin/phpunit --filter test_name` - Run tests matching pattern
- `vendor/bin/behat --config /path/to/behat.yml` - Run Behat tests
- `php admin/tool/phpunit/cli/init.php` - Initialize PHPUnit environment
- `php admin/tool/behat/cli/init.php` - Initialize Behat environment

### CLI Tools
- `php admin/cli/cfg.php` - Get/set configuration values
- `php admin/cli/upgrade.php` - Run database upgrades
- `php admin/cli/install.php` - Install Moodle
- `php admin/cli/install_database.php` - Install database only
- `php admin/cli/maintenance.php` - Enable/disable maintenance mode
- `php admin/cli/purge_caches.php` - Clear all caches
- `php admin/cli/cron.php` - Run cron manually

## Architecture Overview

### Component System
Moodle uses frankenstyle component naming: `{type}_{name}` (e.g., `mod_forum`, `auth_ldap`).

### Plugin Types and Locations
- `/mod/*` - Activity modules (forum, quiz, assignment, etc.)
- `/auth/*` - Authentication plugins (manual, ldap, oauth2, etc.)
- `/blocks/*` - Side blocks for pages
- `/enrol/*` - Enrollment methods (manual, self, cohort, etc.)
- `/theme/*` - UI themes
- `/local/*` - Local customizations
- `/admin/tool/*` - Admin tools
- `/course/format/*` - Course formats (topics, weeks, etc.)
- `/question/type/*` - Question types for quizzes
- `/repository/*` - File repositories
- `/filter/*` - Content filters
- `/report/*` - Various reports
- `/gradeexport/*` and `/gradeimport/*` - Grade import/export plugins

### Core APIs and Subsystems

#### Database API (`$DB`)
```php
// Get single record
$user = $DB->get_record('user', ['id' => $userid]);

// Get multiple records  
$users = $DB->get_records('user', ['deleted' => 0]);

// Custom SQL
$sql = "SELECT * FROM {user} WHERE firstname LIKE ?";
$users = $DB->get_records_sql($sql, ['%John%']);

// Insert/Update/Delete
$DB->insert_record('tablename', $dataobject);
$DB->update_record('tablename', $dataobject); // Must have ->id
$DB->delete_records('tablename', ['id' => $id]);
```

#### Output API (`$OUTPUT`, `$PAGE`)
```php
// Page setup
$PAGE->set_context($context);
$PAGE->set_url('/mod/mymodule/view.php', ['id' => $id]);
$PAGE->set_title($title);
$PAGE->set_heading($heading);

// Rendering
echo $OUTPUT->header();
echo $OUTPUT->render_from_template('core/mytemplate', $data);
echo $OUTPUT->footer();
```

#### Forms API
Forms extend `moodleform` class and use QuickForms2:
```php
class my_form extends moodleform {
    protected function definition() {
        $mform = $this->_form;
        $mform->addElement('text', 'name', get_string('name'));
        $mform->setType('name', PARAM_TEXT);
        $mform->addRule('name', null, 'required');
    }
}
```

#### Access Control
```php
// Check capability
require_capability('mod/forum:viewdiscussion', $context);

// Check if user has capability
if (has_capability('moodle/site:config', $context)) {
    // Admin only code
}

// Define capabilities in db/access.php
```

#### Events System
```php
// Trigger an event
$event = \mod_forum\event\discussion_viewed::create([
    'objectid' => $discussion->id,
    'context' => $context
]);
$event->trigger();

// Listen to events via db/events.php
```

#### File API
```php
// Get file storage
$fs = get_file_storage();

// Get files
$files = $fs->get_area_files($contextid, $component, $filearea, $itemid);

// Create file from string
$filerecord = [
    'contextid' => $context->id,
    'component' => 'mod_mymodule',
    'filearea' => 'content',
    'itemid' => 0,
    'filepath' => '/',
    'filename' => 'myfile.txt'
];
$fs->create_file_from_string($filerecord, 'File contents');
```

### JavaScript Architecture
- **AMD Modules**: Modern JS in `/amd/src/`, built to `/amd/build/`
- **YUI Modules**: Legacy, in `/yui/src/`, avoid for new code
- Templates use Mustache with `{{js}}` blocks for initialization

### Database Schema
- Schema defined in `db/install.xml` files
- Upgrades in `db/upgrade.php` with version checks
- Use XMLDB editor: `/admin/tool/xmldb/` for schema changes

### Language Strings
- Stored in `lang/en/{component}.php` files
- Access via `get_string('stringid', 'component')`
- Placeholders: `get_string('welcome', 'mod_forum', $user->firstname)`

## Development Patterns

### Creating a New Activity Module
1. Create `/mod/mymodule/` directory structure
2. Required files:
   - `version.php` - Version and dependencies
   - `db/install.xml` - Database schema
   - `db/access.php` - Capabilities
   - `lang/en/mod_mymodule.php` - Language strings
   - `mod_form.php` - Module settings form
   - `lib.php` - Required callbacks
   - `view.php` - Main view page

### Working with Contexts
```php
// Get contexts
$systemcontext = context_system::instance();
$coursecontext = context_course::instance($courseid);
$cmcontext = context_module::instance($cmid);

// Context levels: CONTEXT_SYSTEM, CONTEXT_COURSECAT, CONTEXT_COURSE, CONTEXT_MODULE, CONTEXT_BLOCK, CONTEXT_USER
```

### Standard File Organization
```
/componentname/
├── classes/           # Autoloaded classes
├── db/               # Database definitions
│   ├── access.php    # Capabilities
│   ├── install.xml   # Schema
│   ├── upgrade.php   # Upgrade steps
│   └── services.php  # Web services
├── lang/en/          # Language strings  
├── templates/        # Mustache templates
├── amd/src/         # AMD JS source
├── tests/           # PHPUnit tests
├── lib.php          # Library functions
└── version.php      # Version info
```

## Debugging

### Enable Debugging
In `config.php`:
```php
$CFG->debug = (E_ALL | E_STRICT);
$CFG->debugdisplay = 1;
$CFG->debugsmtp = true;
$CFG->perfdebug = 15;
$CFG->debugsqltrace = 1;
```

### Debugging Functions
- `debugging('message', DEBUG_DEVELOPER)` - Show debug message
- `print_object($var)` - Pretty print variable
- `mtrace('message')` - Output in CLI scripts
- MDL_PERF panel shows performance metrics when enabled

### Common Debugging Locations
- Error logs: `$CFG->dataroot/moodledata/` 
- Session data: `$CFG->dataroot/sessions/`
- Cache data: `$CFG->dataroot/cache/`

## Security Considerations

### Input Parameter Types
Always clean input using appropriate PARAM_* types:
- `PARAM_INT` - Integers only
- `PARAM_TEXT` - General text, stripped of tags
- `PARAM_ALPHA` - Letters only
- `PARAM_ALPHANUMEXT` - Letters, numbers, underscore, hyphen
- `PARAM_RAW` - No cleaning (use sparingly)
- `PARAM_CLEANHTML` - Safe HTML

Usage: `$id = required_param('id', PARAM_INT);`

### SQL Injection Prevention
- Always use placeholders: `$DB->get_records_sql($sql, [$param1, $param2])`
- Never concatenate user input into SQL
- Use `{tablename}` notation for table prefixes

### XSS Prevention
- Use `s()` or `format_string()` for output: `echo s($usertext);`
- Use `format_text()` for rich content with proper context
- Templates auto-escape by default, use `{{{var}}}` for unescaped

## Version Information
This is Moodle 5.1dev (Build: 20241216), the development version.
- Stable branches: MOODLE_404_STABLE, MOODLE_403_STABLE, etc.
- Version format: YYYYMMDDXX (date + increment)
- Requires PHP 8.2.0, recommends 8.2.4+

## Additional Resources
- Main documentation: https://moodledev.io
- Dev docs: https://moodledev.io/docs/
- Tracker: https://tracker.moodle.org
- PHPDoc API: https://phpdoc.moodle.org
- Dev forum: https://moodle.org/mod/forum/view.php?id=55