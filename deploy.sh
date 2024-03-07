#!/bin/bash
set -e
set -x

if [ -z "$SSH_TARGET" ]; then
  echo "SSH_TARGET is not set"
  exit 1
fi

rsync -avz --progress --exclude='.git' . $SSH_TARGET:/var/www/production_webons/js
