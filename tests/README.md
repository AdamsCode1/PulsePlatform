# Tests Directory

This directory contains all test files and testing utilities for the PulsePlatform project.

## Structure

### Formal Test Files
- `api.test.ts` - API endpoint tests for societies, events, and RSVPs
- `auth.test.ts` - Authentication API tests
- `user.test.ts` - User API tests
- `setup.js` - Jest test setup configuration

### Debug Scripts
The `debug-scripts/` folder contains development and debugging scripts:
- `create-test-user.js` - Script to create test users for development
- `test-auth-error.js` - Debug script for authentication errors
- `test-confirmed-user.js` - Debug script for user confirmation testing
- `test-login-only.js` - Simple login testing script
- `test-login.js` - Login functionality debugging
- `test-registration.js` - Registration flow testing
- `test-supabase-config.js` - Supabase configuration testing

## Running Tests

To run all formal tests:
```bash
npm test
```

To run debug scripts:
```bash
node tests/debug-scripts/[script-name].js
```

## Configuration

Jest is configured to automatically find test files matching:
- `**/tests/**/*.test.[jt]s?(x)`
- `**/__tests__/**/*.[jt]s?(x)`
- `**/*.(test|spec).[jt]s?(x)`
