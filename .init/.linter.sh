#!/bin/bash
cd /home/kavia/workspace/code-generation/moderncalc-web-71448-d7d7c9e0/calculator_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

