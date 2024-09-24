#!/usr/bin/env sh
set -exo pipefail
cd /app
npm install -SE eslint-plugin-unused-imports
cd /eslint
# eslint --fix --debug src/**/*.ts
eslint --fix src/**/*.ts
