# Repository Guidelines
Always respond in Chinese-simplified
## Project Structure & Module Organization
- `server/` 是 CoffeeScript 后端，包含 `rpc/` 接口、`libs/` 游戏逻辑、`middleware/` 中间件与 `themes/` 预设。
- `client/` 是旧版前端，使用 CoffeeScript、Jade/Pug 与 Stylus。
- `front/src/` 是 TypeScript + React 前端，构建产物输出到 `client/static/front-assets/`。
- 其他资源位于 `manual/`、`language/`、`public/`、`prizedata/`；本地配置放在 `config/`，以 `config.default/` 为模板。

## Build, Test, and Development Commands
- 使用npm 8.17.0 构建或测试 可以通过nvm use 8.17.0来切换npm版本。
- `npm install`：安装根目录后端依赖。
- `Copy-Item -Recurse config.default config`：首次开发时复制本地配置。
- `node app.js`：启动开发服务器，依赖 MongoDB 与 Redis。
- `cd front && npm run watch`：前端开发模式。
- `cd front && npm run production-build`：编译 TypeScript 并打包前端资源，是前端改动的基础冒烟检查。
- `docker compose -f docker/docker-compose.yml up --build`：用容器启动应用与依赖服务。
- 但是你在修改时，不需要真正去跑npm run watch等构建执行操作，因为你必须在高版本node中运行，运行时切版本会出错。

## Coding Style & Naming Conventions
- 遵循 `.editorconfig`：统一 UTF-8、默认 2 空格缩进，`*.coffee` 使用 4 空格。
- `*.ts` 与 `*.tsx` 使用 Prettier，风格为单引号和尾随逗号。
- CoffeeScript 代码遵循 CoffeeLint 约束，避免 tab、分号和反引号。
- 变量与函数使用 `camelCase`，类与类型使用 `PascalCase`，文件命名尽量贴近现有模式，如 `component.tsx`、`elements.tsx`。

## Testing Guidelines
- 仓库目前没有维护中的单元测试体系，`cd front && npm test` 只是占位命令。
- 前端修改至少运行 `cd front && npm run build`。
- 后端、模板、国际化或数据改动后，启动 `node app.js`，手动验证登录、房间列表、建房和相关游戏流程。

## Commit & Pull Request Guidelines
- 最近提交以简短中文标题为主，不使用 `feat:`、`fix:` 这类前缀；一次提交只处理一个主题。
- PR 需说明用户可见影响、配置或数据变更，并关联 issue。
- 涉及 UI、文档页面或资源变更时附截图；若重新生成前端产物，请在描述中明确写出。

## Agent Workflow
- 非琐碎任务先在 `tasks/todo.md` 写可勾选计划，再实施与更新状态。
- 只改必要文件，优先根因修复，完成前必须验证结果并在 `tasks/todo.md` 的 `Review` 记录结论。
