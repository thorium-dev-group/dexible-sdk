#!/bin/sh

VERSION="2.0.0"

yarn workspaces foreach version $VERSION;
yarn run build;
yarn run do_publish;
