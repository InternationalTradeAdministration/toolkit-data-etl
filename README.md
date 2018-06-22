# Toolkits Search

[![Build Status](https://travis-ci.org/InternationalTradeAdministration/toolkit-data-etl.svg?branch=master)](https://travis-ci.org/InternationalTradeAdministration/toolkit-data-etl)

## Install

Clone this repository.

```
cd /your/path
npm install

# create your own copy of .env and update it
cp .env.example .env

# create your own copy of local.env and update it
cp local.env.example local.env

# create your own copy of deploy.env and update it
cp deploy.env.example deploy.env

```

## Scripts

```
cd /your/path
npm run test # run specs
npm run local # run node-lambda using environment variables from local.env
npm run fix # run standard --fix on js files in lib
npm run fixtest # run standard --fix on specs in test directory
npm run package # just generate the zip that would be uploaded to AWS
npm run deploy # deploy to AWS using environment variables from deploy.env
```
