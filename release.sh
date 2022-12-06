#!/bin/sh

VERSION="2.0.2"

yarn workspaces foreach version $VERSION;
yarn run build;
yarn run do_publish;
