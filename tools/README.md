# Development Tools

This directory contains various development and utility tools for the PulsePlatform project.

## Directory Structure

### `/admin`
Administrative utilities and tools:
- `createAdminSession.mjs` - Create admin sessions for testing
- `debug-admin.js` - Debug admin-related functionality

### `/database`
Database management and inspection tools:
- `checkTables.mjs` - Check database table structure and contents

### `/testing`
Testing utilities and scripts:
- `testAdminAuth.mjs` - Test admin authentication
- `testPasswords.mjs` - Password testing utilities
- `testUsers.mjs` - User management testing

## Usage

All tools can be run directly with Node.js:
```bash
node tools/admin/createAdminSession.mjs
node tools/database/checkTables.mjs
node tools/testing/testUsers.mjs
```

Make sure your `.env.local` file is properly configured before running these tools.
