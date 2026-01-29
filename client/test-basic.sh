#!/bin/bash
# Wrapper script to allow --reporter=basic to work
npm run test:run -- --reporter=./src/test/reporters/basic.ts "$@"
