#!/bin/bash
cd /home/kavia/workspace/code-generation/food-order-management-system-51428/food_ordering_web
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

