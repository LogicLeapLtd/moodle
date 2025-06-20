#!/bin/bash

# Start Development Environment for Moodle
echo "🚀 Starting Moodle Development Environment..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "📦 Starting PostgreSQL..."
    # Try to start PostgreSQL (adjust based on your system)
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start postgresql@14 || brew services start postgresql
    elif command -v systemctl &> /dev/null; then
        # Linux with systemd
        sudo systemctl start postgresql
    else
        echo "⚠️  Please start PostgreSQL manually"
    fi
    
    # Wait for PostgreSQL to be ready
    echo "⏳ Waiting for PostgreSQL to start..."
    for i in {1..30}; do
        if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
            echo "✅ PostgreSQL is running!"
            break
        fi
        sleep 1
    done
else
    echo "✅ PostgreSQL is already running"
fi

# Check if database exists
if ! psql -U moodleuser -d moodle -h localhost -c '\q' 2>/dev/null; then
    echo "📝 Database 'moodle' not found. Creating database..."
    # Detect the PostgreSQL superuser
    if psql -U postgres -c '\q' 2>/dev/null; then
        PGUSER="postgres"
    elif psql -U $USER -c '\q' 2>/dev/null; then
        PGUSER="$USER"
    else
        echo "❌ Could not connect to PostgreSQL. Please ensure it's running."
        exit 1
    fi
    
    echo "🔧 Using PostgreSQL user: $PGUSER"
    
    # Create user and database if they don't exist
    psql -U $PGUSER -h localhost <<EOF
-- Create user if not exists
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'moodleuser') THEN
    CREATE USER moodleuser WITH PASSWORD 'moodlepass';
  END IF;
END\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE moodle OWNER moodleuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'moodle')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE moodle TO moodleuser;
EOF
    echo "✅ Database setup complete!"
fi

# Start PHP built-in server
echo "🌐 Starting PHP server on http://localhost:8000"
echo ""
echo "📚 Moodle Admin Credentials:"
echo "   URL: http://localhost:8000"
echo "   Username: admin"
echo "   Password: (run 'php reset-admin-password.php' to set to Admin123!)"
echo ""
echo "💡 Tips:"
echo "   - To reset admin password: php reset-admin-password.php"
echo "   - Admin panel: http://localhost:8000/admin"
echo "   - Login page: http://localhost:8000/login"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start PHP server
php -S localhost:8000