#!/usr/bin/env pwsh

# NSwag Client Generation Script for Social Coordination App
# Prerequisites: Install NSwag CLI globally: dotnet tool install -g NSwag.ConsoleCore
#
# Usage:
#   1. Start the backend: cd Backend/SocialCoordinationApp && dotnet run
#   2. Download the spec: curl -o swagger/apiSpec.json http://localhost:5219/swagger/v1/swagger.json
#   3. Run this script: pwsh swagger/swaggerScript.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

nswag openapi2tsclient `
    /input:"$scriptDir\apiSpec.json" `
    /output:"$projectRoot\src\clients\generatedClient.ts" `
    /className:SocialCoordinationApiClient `
    /template:Axios `
    /generateClientInterfaces:true