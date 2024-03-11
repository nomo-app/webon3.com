#!/bin/bash
set -e
set -x

if [ -z "$SSH_WEBON3" ]; then
  echo "SSH_WEBON3 is not set"
  exit 1
fi

rsync -avz --progress "webon3.com/" $SSH_WEBON3:/var/www/html
