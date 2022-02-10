#!/bin/sh

VERSION="0.1.36"

yarn workspaces foreach version $VERSION;
yarn run build;
yarn run do_publish;
