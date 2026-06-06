# Repository Guidelines

## Project Structure & Module Organization

This is a Node.js SocketStream werewolf game application. The main server entry is `app.js`, with startup helper code in `starter.js`. Server-side CoffeeScript lives in `server/`: RPC handlers are under `server/rpc/`, middleware under `server/middleware/`, and game themes under `server/themes/`. Legacy client templates and static assets are in `client/`. The TypeScript/React frontend is in `front/src/`, with webpack output copied to `client/static/front-assets/`. Copy `config.default/` to `config/` for local runtime settings. Documentation and manuals live in `docs/` and `manual/`; Docker files are in `Dockerfile` and `docker/`.

## Build, Test, and Development Commands

- `npm install`: install root SocketStream/server dependencies.
- `Copy-Item -Recurse config.default config`: create local configuration; edit `config/app.coffee`.
- `node app.js`: run development mode with MongoDB and Redis available.
- `cd front; npm install`: install frontend dependencies.
- `cd front; npm run watch`: continuously rebuild frontend assets.
- `cd front; npm run production-build`: build production frontend assets into `client/static/front-assets`.
- `SS_ENV=production SS_PACK=1 node app.js`: run the production server after building assets.
- `docker compose -f docker/docker-compose.yml up --build`: run the app with MongoDB and Redis via Docker.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, final newline, spaces, 2-space indentation by default, and 4-space indentation for `.coffee` files. CoffeeScript linting is configured in `coffeelint.json`; avoid tabs, trailing whitespace, trailing semicolons, and non-camel-case classes. Frontend TypeScript uses Prettier with single quotes and trailing commas. Keep theme files named after their theme identifier where possible.

## Testing Guidelines

There is no active root test script and `front/package.json` has a placeholder `npm test`. For frontend build validation, use `cd front; npm run test:manual-build`, which runs TypeScript and a webpack dev-check bundle. For server changes, run `node app.js` against local MongoDB and Redis and manually exercise affected RPC/game flows.

## Commit & Pull Request Guidelines

Recent history uses short, direct commit subjects, often in Chinese, such as `名字修正` or `主题`. Keep subjects concise and focused on one change. Pull requests should describe the behavior change, list manual verification commands, mention configuration or migration steps, and include screenshots for visible UI changes. Link related issues when available.

## Security & Configuration Tips

Do not commit local secrets from `config/`, database dumps, or generated runtime data. Keep `config.default/` as the documented template. Treat `prizedata/*.csv` as project data and review changes carefully before committing.
