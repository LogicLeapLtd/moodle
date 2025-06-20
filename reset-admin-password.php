<?php
// Reset Moodle Admin Password
// Run this script from command line: php reset-admin-password.php

define('CLI_SCRIPT', true);
require_once(__DIR__ . '/config.php');
require_once($CFG->libdir.'/clilib.php');

// Get admin user
$admin = $DB->get_record('user', array('username' => 'admin'));

if (!$admin) {
    echo "❌ Admin user not found!\n";
    exit(1);
}

// Set new password
$newpassword = 'Admin123!';

// Update password
$admin->password = hash_internal_user_password($newpassword);
$DB->update_record('user', $admin);

echo "✅ Admin password has been reset!\n";
echo "\n";
echo "📚 Admin Credentials:\n";
echo "   Username: admin\n";
echo "   Password: $newpassword\n";
echo "\n";
echo "🔐 Remember to change this password after logging in!\n";