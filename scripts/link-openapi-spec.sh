#!/bin/bash

dotnet clean
dotnet restore
dotnet build
dotnet build /t:GenerateOpenApiDocuments

map_json=`pwd`/services/api/docs/open-api.json
spec=$(cat $map_json | jq -c '.')

echo "export type ApiSpec=$spec" > `pwd`/packages/lib/src/api/types/spec/api-spec.ts