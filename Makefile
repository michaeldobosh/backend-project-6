setup: prepare install db-migrate

install:
	npm install

db-migrate:
	npx knex migrate:latest

build:
	npm run build

prepare:
	cp -n .env.example .env || true

start:
	heroku local -f Procfile.dev

start-backend:
	npm start -- --watch --verbose-watch --ignore-watch='node_modules .git .sqlite'

start-frontend:
	npx webpack --watch --progress

lint:
	npx eslint .
	
test-coverage:
	NODE_OPTIONS=--experimental-vm-modules npx jest --bail --coverage --coverageProvider=v8 --unhandled-rejections=strict

test:
	npm test -s