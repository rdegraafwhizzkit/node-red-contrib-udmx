#!/usr/bin/env bash

VERSION=$(jq -r '.version' package/package.json)
NAME=$(jq -r '.name' package/package.json)

tar cf - package|gzip > ${NAME}-${VERSION}.tgz
