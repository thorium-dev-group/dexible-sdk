#!/bin/sh

VERSION="1.0.4"

yarn workspaces foreach version $VERSION;
yarn run build;
yarn run do_publish;
