#!/bin/bash

cd `pwd`/services/api
dotnet build
swagger tofile --output /tmp/rewear-api-map.json ./bin/Debug/net10.0/ReWear.dll v1
cd -

spec=$(cat /tmp/rewear-api-map.json | jq -c '.')

echo "export type ApiSpec=$spec" > `pwd`/packages/lib/src/api/types/spec/api-spec.ts