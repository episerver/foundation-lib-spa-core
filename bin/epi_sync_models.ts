#!/usr/bin/env node

/**
 * Main entry point for the epi-sync-models command, loads the context
 * and starts the script as ESNext Modules.
 */

// Load dependencies
const path = require('path');
const esm = require('esm')(module, {});
const syncModule = esm('./epi_sync_models.module');

// Create context && execute
const cwd = process.cwd();
const configFile = path.join(cwd, ".env");
const sync = new syncModule.EpiModelSync(cwd, configFile)
sync.run();