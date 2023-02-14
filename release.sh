#!/bin/sh

OLD_V="1.1.0-beta.11"
VERSION="1.1.0-beta.12"

for f in `find ./packages -name "package.json" -not -path "*/node_modules/*" -type f`
do 
    echo "Updating ${f}";
   sed -i '' -e 's/'${OLD_V}'/'${VERSION}'/g' $f
   #cat $f | jq ".version=\"$VERSION\"" > ${f}.tmp
   #mv ${f}.tmp $f
done

#yarn workspaces foreach run yarn npm info; 
yarn run build;
yarn run do_publish --tag beta;
