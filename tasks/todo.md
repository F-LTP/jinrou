# 当前任务（2026-06-01 日志卡顿方案分提交落地）

- [x] 方案一：将 `pickup` 从动态选择器过滤改为静态规则 + 节点增量标记
- [x] 方案二：降低玩家区父子联动 `hover` 的样式失效传播范围
- [x] 方案三：收缩日志节点上 `data-userid` 的冗余挂载，减少匹配面
- [x] 每个方案分别完成本地构建校验并单独提交（不 push）
- [x] 在本文末尾追加 Review，并同步 `tasks/lessons.md`

## Check-in

- 本轮只提交与三项方案直接相关的文件，保留并忽略现有 `AGENTS.md` 未提交改动。
- 提交顺序固定为：方案一 -> 方案二 -> 方案三；每完成一项立即勾选并提交一次。
- 每个提交后都执行 `front/npm run build:tsc` 验证，确保分提交可独立落地。

## Review

- 已将 `pickup` 的动态 `styled-components` 选择器替换为固定 `.jf-log.is-dimmed` 规则，避免按用户 ID 生成动态 CSS 与 `:not([data-userid=...])` 的大范围匹配。
- 已移除玩家框工具图标的 `${Wrapper}:hover &` 父子联动选择器，消除 trace 中出现过的 hover 样式失效来源。
- 已清理日志子节点上的冗余 `data-userid` 属性；当前筛选变暗由 React 计算 `dimmed` 后附加 class，不再依赖 DOM 属性选择器。
- 三个方案均已分别运行 `front/npm run build:tsc` 并通过；提交过程中 husky 也对相关 TS/TSX 文件执行了 prettier。
- 本轮只创建本地提交，没有 push；现有 `AGENTS.md` 仍是用户原有未提交改动，未纳入这些提交。

# 当前任务（2026-05-24 全站回归测试）

- [ ] 逐页检查首页、休息室、房间一览、个人页、设置页、手册页、新房间页、游戏房间页的控制台运行时报错
- [ ] 重点点击常用按钮并观察是否触发新的 React/webpack/runtime 异常
- [ ] 记录发现的残留问题，若真有问题再单独开修复任务

## Check-in

- 本轮以“新开页面 + DevTools 观察控制台”为准，不沿用旧标签页，避免缓存坏 chunk 影响结论。
- 优先覆盖高频入口与高风险交互：进入页面、展开/收起面板、提交表单、弹窗打开关闭、房间内发言与规则按钮。

# 当前任务（2026-05-24 watch 模式 Pug 依赖断裂修复与覆盖）

- [x] 复现并定位 `npm run watch` 下 manual/jade 相关的 webpack 编译报错
- [x] 修复 `front` 本地 Pug 运行时依赖断裂，确保 watch/build 使用同一套可解析依赖
- [x] 增加可执行校验，覆盖 manual/jade 这条编译链路的回归风险
- [x] 在本文末尾补充 Review，并同步 `tasks/lessons.md`

## 规格

- 目标不是临时压住报错，而是修掉 `front` 自身依赖图里导致 `pug-runtime` 丢失的根因。
- 修复后需要兼顾 `build` 与 `watch`，避免只让生产构建通过、开发时仍在页面跳转后炸掉。
- 测试覆盖优先选“当前仓库里可稳定执行的构建级校验”，不要引入一套空壳测试框架。

## Check-in

- 执行顺序固定为：先复现并确认依赖缺口，再补依赖/配置，最后追加校验脚本并验证。

## Review

- 已确认 `npm run watch` 下 manual/jade 报错的根因是 `front` 自己缺少 `pug` 这条 `pug-loader` 的 peer 依赖，导致开发态编译在解析 `manual/**/*.jade` 时会落到不存在的 `front/node_modules/pug-runtime/index.js`。
- 已在 `front/package.json` 显式补上 `pug@2.0.3`，并保留 `pug-loader`；这样 `front` 目录单独执行的 `watch`、`build` 与 `production-build` 终于共用同一套可解析依赖，不再依赖根目录偶然 hoist 的结果。
- 已补充 `build:bundle:dev-check`、`watch:bundle:dev-check`、`clean:tmp-webpack-check` 与 `test:manual-build`，让 manual/jade 这条链路可以在不占用真实输出目录的情况下做稳定回归检查。
- `front/npm run test:manual-build` 与 `front/npm run production-build` 已通过，说明源码与构建链本身已可用。
- 随后在手册页继续暴露出的 `react-draggable` 兼容问题，已通过升级到 `react-draggable@4.5.0` 并在对话框基座接入 `nodeRef` 一并修掉。
- 最关键的复测结论是：旧标签页里确实可能继续引用先前那份损坏的 dev chunk，例如 `dialog-dist-esm_dialog_index_js.e321a9198d453d3c9ebc.bundle.js`；但在新建隔离页后，页面已改为加载新的 `vendor_react_draggable-node_modules_react-draggable_build_cjs_cjs_js.*.bundle.js` 与 `dialog-dist-esm_dialog_index_js.645cef47445f135ff285.bundle.js`，控制台只剩 React DevTools 提示，没有再出现 `Cannot find module 'react-draggable'`、`componentWillReceiveProps` 或 `findDOMNode` 警告。
- 这一轮因此收敛为“两层问题都已解决”：源码/依赖层已经修通，浏览器侧剩余异常来自旧页面缓存旧 chunk；后续验证必须新开页面或至少硬刷新后再下结论。

# 当前任务（2026-05-24 React18 运行时警告清理与生产级复查）

- [x] 复核当前前端运行时警告，区分业务代码问题与三方库兼容问题
- [x] 清理可直接修复的 React18 运行时风险，并收敛剩余第三方升级项
- [x] 以前端运行时、后端启动链、公共兼容层为重点做三轮代码复查
- [x] 在 Node `v24.13.0` 下回归 `front/npm run build:tsc`、`front/npm run production-build` 与根目录 `node app.js`
- [x] 在本文末尾补充 Review，并同步 `tasks/lessons.md`

## 规格

- 这轮目标不是只压住控制台输出，而是尽量消除 React18 升级后“能编译但浏览器运行时报错/告警”的高风险点。
- 必须区分三类问题：会阻塞运行的异常、由项目代码触发的 React18 不当用法、仅来自旧第三方库的兼容警告。
- 复查范围包含前端与后端，但优先级以真实运行链路和公共基础设施为先，不做无效大扫除。
- 若某个警告只能通过升级旧依赖消除，需要先确认与当前代码的兼容边界，再决定是否在本轮直接升级。

## Check-in

- 执行顺序固定为：先定位现有警告来源，再修项目内可控问题，最后对前后端做三轮复查并验证。
- 最终结论必须明确列出“已消除的问题”“剩余非阻塞警告”“仍需单独升级的依赖项”。

## Review

- 运行时浏览器告警已经进一步收敛到只剩两类：`React DevTools` 提示，以及一条由外链头像源触发的 `CORB/ORB` issue；此前 React18 相关的 `translator` 异常、`FontAwesome defaultProps` 警告、`react-transition-group legacy context` 警告都已不再出现。
- 已补齐游戏页发言区、遗言/笔记、开房配置、踢人弹窗、头像弹窗等一批真实表单字段的 `name/id`，浏览器里原先的 `A form field element should have an id or name attribute` issue 已消失。
- 已把微博 SDK 从模板层的“全站无条件注入”改为仅在 `Config.weibo.enable` 为真时加载，开发环境下不再因为未绑定域名的第三方脚本制造额外控制台噪音。
- 已为日志头像、玩家头像、个人资料头像与头像预览统一补上 `referrerPolicy=\"no-referrer\"`；这能收敛一部分外链图床的 Referer 拦截，但当前 `img.picgo.net` 这条资源即便不带 Referer 仍返回会被 Chromium `ORB` 拦截的响应，因此它被确认是外部资源质量问题，不是 React18 运行时兼容问题。
- 三轮复查结果如下：
- 第一轮前端运行时：通过 Chrome DevTools 直接复查 `http://127.0.0.1:8800/room/418`，确认项目内 React18 运行时异常与表单 issue 已清空。
- 第二轮前端构建链：`front/npm run build:tsc` 与 `front/npm run production-build` 在 Node `v24.13.0` 下再次实际通过。
- 第三轮后端启动链：通过 `node -e \"require('./server/node24-compat'); require('./app')...\"` 复查时，Mongo 连接成功，启动流程已走到监听端口；当前退出原因是已有实例占用 `8800`（`EADDRINUSE`），不是新的 Node24 兼容崩溃。
- 当前仍需单独排期的风险有两项：
- `mobx-react@5.4.4` 仍与 React18 存在旧 peer 关系，这轮虽未再触发页面异常，但长期看仍建议再做一轮 MobX 线升级评估。
- 后端旧 SocketStream / Connect 依赖在 Node24 下仍会输出 circular dependency warning；它不阻塞当前运行，但属于老链路技术债。

# 当前任务（2026-05-24 React18 迁移落地）

- [x] 盘点 `react / react-dom / mobx / mobx-react / styled-components` 当前版本与升级边界
- [x] 收敛 React18 迁移的公共兼容点（入口挂载、`children`、`i18n`、旧 HOC 类型）
- [x] 修复 React18 下的运行时崩溃点与首屏挂载时序问题
- [x] 在 Node `v24.13.0` 下回归 `front/npm run build:tsc` 与 `front/npm run production-build`
- [x] 在本文末尾补充 Review，并同步 `tasks/lessons.md`

## 规格

- 本轮目标从“升级评估”切换为“React18 包与现有前端代码实际跑通”。
- 保持 Node `v24.13.0` 运行前提，不回退 Node8。
- 允许对旧公共封装做最小兼容改写，但不顺手重写大块业务逻辑。
- 若仍有旧三方库只剩开发期警告，需要与“会阻塞页面运行的异常”明确区分。

## Check-in

- 执行顺序固定为：先清 React18 类型阻塞，再修运行时挂载兼容，最后做构建回归。
- 若升级收益主要体现在“为后续性能排查提供更健康的 React 运行时”，需要在 Review 中明确写清，不把它夸大成已直接解决 418 卡顿。

## Review

- 前端依赖现已切到 React `18.3.1` / ReactDOM `18.3.1`，并保留当前仓库可工作的 webpack5 + styled-components5 组合。
- 已补齐 React18 下不再隐式注入的 `children` 类型，并把旧的 `withTranslationFunction` 从 `recompose/fromRenderProps` 改成显式 HOC，消除了主要的 TypeScript 迁移阻塞。
- 已修复 `i18n` 运行时崩溃根因：此前自定义翻译函数直接透传 `i18n.t`，丢失 `this` 绑定后会在页面里触发 `Cannot read properties of undefined (reading 'translator')`；现已改为绑定实例后再包装。
- 已把 `mountReact` 首次挂载改为 `flushSync`，避免旧页面初始化链路在 `createRoot` 并发挂载尚未完成时就收到 store/socket 更新，减少 `setState on component that hasn't mounted yet` 这类启动期警告。
- 已移除 `SpeakForm` 在 render 期间通过 `setTimeout` 回写快捷输入状态的模式，避免 React18 下再次触发“未挂载先更新”的开发期警告。
- `front/npm run build:tsc` 与 `front/npm run production-build` 已在 Node `v24.13.0` 下实际通过。
- 当前剩余控制台输出主要是旧三方库的开发期警告：`@fortawesome/react-fontawesome@0.1.x` 的 `defaultProps` 提示，以及 `react-transition-group@2.x` 的 legacy context 提示；它们不再是阻塞页面运行的异常，但若要彻底清掉，需要单独再做一轮依赖升级与回归。

# 当前任务（2026-05-23 Node24 运行时与构建链升级收尾）

- [x] 收敛当前工作树，只保留 Node24 跑通所需的构建链升级改动
- [x] 修复 `front` 在 Node `v24.13.0` 下的 TypeScript 编译阻塞
- [x] 在 Node `v24.13.0` 下跑通 `front/npm run production-build`
- [x] 在 Node `v24.13.0` 下跑通根目录 `node app.js`
- [x] 在本文末尾补充 Review，并同步 `tasks/lessons.md`

## 规格

- 这轮目标从“升级评估”切换为“在当前机器上实际跑通前后端入口”。
- 保持“正式现代化”方向，不回退到 Node 8，也不靠零散 `any` 补丁堆过去。
- 若默认前端产物目录继续被本地 watch 锁住，需要先区分“构建链不兼容”和“用户本地进程占锁”。
- 后端兼容以 `node app.js` 的真实报错为准，逐项消除 Node24 不兼容点。

## Check-in

- 执行顺序固定为：先修 `front` 的 `tsc`，再验证前端生产构建，最后处理根目录启动。
- 每一步都记录实际命令结果与剩余阻塞，不跳过验证直接下结论。

## Review

- 已在 Node `v24.13.0` 下把前端构建链升级到可运行组合：webpack 5、webpack-cli 5、新版 Manifest/Copy 插件、React 16.14、styled-components 5。
- `front/npm run production-build` 已实际跑通；webpack5 额外兼容修复包括 YAML 资源按 JSON 模块处理、旧 `splitChunks` 命名规则改写，以及若干旧版 `styled-components` 类型兼容修复。
- 根目录 `node app.js` 的 Node24 阻塞点收敛到老 `connect` 静态链依赖 `res._headers`；已通过仓库内兼容层补回旧响应头接口，并确认服务可启动。
- 当前工作树已恢复干净，可在此基础上继续做下一轮依赖升级或性能相关验证。

# 当前任务（2026-05-11 Node24 正式现代化升级）

- [ ] 锁定升级范围并更新依赖基线（TypeScript、webpack、webpack-cli、关键插件）
- [ ] 迁移 `webpack.config.js` 到 webpack5 可用配置（插件 API 与 hash 策略）
- [ ] 在 Node `v24.13.0` 下跑通 `front` 的 `build:tsc`、`build:bundle`、`production-build`
- [ ] 回归检查 418 房间关键页面是否可加载并记录风险
- [ ] 在本文末尾补充 Review，并同步 `tasks/lessons.md`

## 规格

- 目标是“正式现代化”，不是临时兼容补丁。
- 升级后以 Node `v24.13.0` 为主运行环境。
- 不引入虚拟滚动，不改日志业务语义，只处理构建链与运行兼容。
- 如果出现不可回避的三方兼容断点，优先以最小可控改动修复，并保留后续升级建议。

## Check-in

- 执行顺序：先改依赖，再改 webpack 配置，最后在 Node24 下完整构建验证。
- 我会每一步都给出可执行结果（成功/失败与错误点），再继续下一步。

# 当前任务（2026-05-11 Node24 正式现代化升级-重做）

- [ ] 升级前端构建依赖到 Node24 兼容版本（TypeScript5 / webpack5 / 关键插件）
- [ ] 迁移 `front/webpack.config.js` 到 webpack5 API（Manifest/Copy/hash）
- [ ] 在 Node `v24.13.0` 下跑通 `front` 的 `build:tsc`、`build:bundle`、`production-build`
- [ ] 更新 Review 与经验记录，确认仓库可复用

## 规格

- 用户已重置暂存区，要求从干净状态重做此前升级。
- 目标是正式现代化，不是临时兼容补丁。
- 保持业务逻辑不变，仅升级构建链与必要类型兼容。

## Check-in

- 执行顺序固定为“依赖 -> webpack 配置 -> 构建验证 -> 记录”。

# 当前任务（2026-04-07 418 发送卡顿 React 渲染复查）

- [x] 复查当前工作树并确认用户刚否定的“拆开读取/延后回填”改动范围
- [x] 立即撤销 `front/src/pages/game-view/logs/store.ts` 中这条方向上的新增改动
- [x] 重新打开 `418` 房间，按稳定路径复现并录制发送卡顿
- [x] 只围绕 React 渲染/commit/store 更新扇出定位根因
- [x] 实施最小修复并更新 Review

## 规格

- 用户已再次明确：不能做“拆开读取”，不要做虚拟滚动。
- 本轮不再把日志渐进回填调度当作优化方向。
- 排查重点转到更底层的 React 渲染问题，包括组件重复 mount/update、props 不稳定、MobX action 更新扇出和发送回显时的 commit 范围。
- 仍按“刷新 `418` 房间 -> 打开并关闭 `chrome://flags` -> 返回房间 -> 发送消息”的固定路径复现。

## Review

- 本轮先接管并落盘了上一份稳定态发送 trace `C:\Users\kl\Downloads\jinrou-new\tmp-send-trace-20260407-stable-send.json`；离线复核时，旧热点仍被 `webpack-internal:///./dist-esm/pages/game-view/logs/store.js line 63` 的大量 idle 回调淹没，说明这份 trace 只能继续当“错误方向提示”，不能直接作为修复目标。
- 结合当前源码，新的高价值嫌疑点收缩到 `Game` 顶层 `observer` 和 `getjobinfo` 的整包对象替换：发送回显时 `roleInfo`、`gameInfo`、`rule`、`icons` 等 props 容易一起换引用，把 5000+ 条日志子树顺手拖进 React 更新。
- 实施的最小修复落在 `front/src/pages/game-view/component.tsx`：
- 把日志区从 `Game` 顶层 render 中抽成 `React.memo` 的 `LogsPane`。
- 对 `icons`、`rule`、`logVisibility`、`logPickup` 和 `ruleOpen` 做自定义比较，避免 `getjobinfo` 带来的无关 props 变动重新渲染整片日志。
- 保持日志真正新增时仍由 `Logs` 自身的 MobX 观察链路更新，不改日志协议，也不引入虚拟滚动或拆分读取。
- 已在当前环境下运行 `cd front && npm run build:tsc`，通过。
- 已按用户指定顺序重新复测：等待 watch 生效后刷新 `418` 房间，打开并关闭 `chrome://flags`，返回房间发送 `memo-trace-20260407-logs-pane-1`，并录得新 trace `C:\Users\kl\Downloads\jinrou-new\tmp-send-trace-20260407-after-memo.json`。
- Chrome DevTools 对这次发送交互给出的 `INP` 为 `93ms`，处于 Good 区间；拆解结果是 `input delay 19ms / processing 34ms / presentation 40ms`，已经不再是之前那种几百毫秒级的主线程阻塞。
- 新 trace 里已查不到旧热点 `logs/store.js line 63`，说明这次发送窗口里不再把那条旧的日志补渲染链路重新拖进来。
- 这份短 trace 里仍能看到少量后续任务落在 `http://127.0.0.1:8800/_serveDev/system?...`，但它们没有把本次发送交互的 `INP` 拉高；现阶段更像 watch/dev runtime 或交互后续噪音，而不是这次发送卡顿的主路径。
- 现阶段可以把本轮根因收缩为：顶层 `observer` 对大日志子树的无关重渲染放大了发送回显成本；当前最小修复已经显著压低发送交互延迟。

# 当前任务（2026-04-07 418 发送回显 Trace 复查）

- [x] 接管并收尾发送回显 trace，确认 trace 文件落盘
- [x] 分析发送路径长任务，区分“发送回显”与“历史日志补渲染”
- [x] 调整大日志历史补渲染调度，避免用户交互期一次性挂载 100 条旧日志
- [x] 等待 watch 生效后按同一路径重新录制/复测
- [x] 在本文末尾补充 Review

## 规格

- 用户最新要求是自己复现、自己录性能数据、自己修改。
- 必须沿“刷新 `418` 房间 -> 打开并关闭 `chrome://flags` -> 返回房间 -> 发送消息/点规则”的稳定路径验证。
- 本轮以当前新 trace 为准，不再继续凭旧结论猜测。
- trace 若证明卡顿来自历史日志后台补渲染，就优先收紧其调度，避免把用户交互和后台回填混在同一长任务里。
- 不把 `contain`、日志分段或虚拟滚动当主方案。

## Review

- 已接管上一轮未收尾的发送 trace，并在 `C:\Users\kl\Downloads\jinrou-new\tmp-send-trace-20260407.json` 上离线确认旧热点：发送相关长任务窗口里出现了 `100` 次 `DIV class='jf-log ...'` 插入，正好等于当时 `LogsRenderingState` 的固定批量 `periodLogNumber = 100`。
- 旧 trace 同一窗口里还出现了 `300` 量级的 `WithTheme(OneLogInner)` / `OneLogInner` / `TimeInner` / `NameInner` mount 事件，证明用户点发送时并不只是回显一条新消息，而是被后台历史日志补渲染顺手挂进了主线程。
- 本轮在 `front/src/pages/game-view/logs/store.ts` 收紧了历史日志回填调度：
- 把固定批量从 `100` 降到 `20`。
- 在 `visibilitychange`、点击和按键后暂停回填 `1500ms`。
- 只有在页面可见且真正空闲时才继续注册下一次 `requestIdleCallback`。
- 已在 `front/` 目录运行 `npm run build:tsc`，通过。
- 已按用户要求重新走同一路径复测：刷新 `418` 房间，打开并关闭 `chrome://flags`，返回房间后发送 `trace-send-check-20260407-03`，并离线分析新 trace `C:\Users\kl\Downloads\jinrou-new\tmp-send-trace-20260407-after-fix.json`。
- 新 trace 的发送窗口里，不再出现 `jf-log` 行节点插入；同一窗口只剩 `4` 个与日志行无关的普通 `div` 插入，且已看不到 `OneLogInner` / `WithTheme(OneLogInner)` 的批量 mount。
- 新 trace 里第一批 `jf-log` 插入被明确推迟到了发送窗口之后，首次出现时间约为 `4663119.430ms`，并且单批数量收缩到 `20` 条，与新的回填批量一致，说明“旧日志补渲染”和“发送回显”已经被拆开。
- 结合前后对比，这一轮已经命中了最突出的错误路径：发送相关长任务不再夹带“后台一次性挂 100 条旧日志”。
- 仍有剩余热点未完全消失：发送后还有一段约 `318ms` 的 `RunTask`，其中 `socket.onmessage` 相关 `FunctionCall` 约 `268ms`；如果你体感仍然偏卡，下一轮应该继续收缩 `client/code/pages/game/game.coffee` 里的 `sentlog/getjobinfo` 更新扇出，而不是再回到日志补渲染这条线。

# 当前任务（2026-04-07 418 房间高日志卡顿自动调试）

- [x] 复习 `tasks/lessons.md`、现有任务记录与相关脏工作树改动
- [x] 回退当前日志区里的 `contain: layout style paint`，恢复稳定复现条件
- [x] 按“418 房间刷新 -> `chrome://flags` -> 关闭返回房间 -> 点击规则或发送消息”流程复现卡顿
- [x] 结合当前代码与浏览器实测，收缩到最小根因
- [x] 实施最小修复并等待 watch 自动构建生效
- [x] 回到 418 房间复测，并在本文末尾补充 Review

## 规格

- 本轮目标不是泛泛优化，而是围绕用户给定的固定复现步骤定位并修复“非常卡的主线程阻塞”。
- 复现前先移除当前用于缓解的 `contain: layout style paint`，避免被临时缓解手段掩盖现象。
- 复现顺序已由用户再次确认：必须先刷新 418 房间，再打开并关闭 `chrome://flags`，之后再点击“规则”或发送消息。
- 需要同时关注两条触发路径：
- 点击“规则”后的卡顿。
- 发出一条新消息并回显到日志后的卡顿。
- 用户已说明本地另开了 `front` 的 `npm run watch`，本轮修改后不手动重跑前端构建，只等待自动构建产物刷新。
- 用户已再次明确：不要通过“切成小段”优化，发送回显侧需要改更底层的日志 React 渲染方式。

## Review

- 已按用户指定顺序完成复现与回归验证：刷新 `418` 房间，打开并关闭 `chrome://flags`，返回房间后分别验证了“规则”与“发言回显”两条路径。
- 根因一已收缩为桌面端规则面板打开时通过 `width` 动画把日志区横向挤窄；实测旧现象是日志主区会从约 `1236.67px` 缩到约 `916.67px`，导致 5000+ 行日志整体参与重排。
- 本轮已把桌面端规则面板改成覆盖式滑入：`front/src/pages/game-view/component.tsx` 里规则宿主现在固定占 `0` 宽，打开后只让面板自身滑入覆盖，不再改变日志区宽度。
- 回归时再次量测主区宽度，规则关闭时日志区约 `1236.67px`，打开规则后仍保持约 `1236.67px`；规则面板自身覆盖在右侧约 `320px` 区域，没有再挤压日志布局。
- 根因二继续收缩到大日志模式下“当前天 chunk 内的新日志插入方式”；此前固定尺寸日志按倒序直接生成子元素，新消息会落到列表头部，React 需要从当前天 chunk 的最前面开始对比。
- 本轮在 `front/src/pages/game-view/logs/index.tsx` 与 `front/src/pages/game-view/logs/elements.tsx` 里把固定尺寸日志改成“chunk 内 DOM 正序 + `column-reverse` 视觉倒序”，并把翻译函数提升到 `Logs` 外层，减少 chunk 内额外的 render-props 开销。
- 浏览器实测发送一条 `codex-send-check-20260407-01` 后，总日志数从 `5122` 增到 `5123`，当前天 chunk 子节点从 `3468` 增到 `3469`，新消息命中了该 chunk 的最后一个子节点索引 `3468`，说明新增日志已走 chunk 尾部追加而不是头部插入。
- 已删除 `front/src/pages/game-view/rule.tsx` 中的 `console.log('rule!', rule);`，复测后控制台里不再出现这条规则调试输出。
- 已在 `front/` 目录运行 `npm run build:tsc`，通过。
- 用户在这轮回归后再次明确反馈：发送消息时依然会“特别卡”，因此本段结论只可视为已解决了“规则面板挤压日志宽度”和“固定尺寸日志头插入”两个局部问题，不能视为发送回显卡顿已完成。
- 下一步必须直接录制当前版本的发送回显性能数据，继续定位剩余热点。

# 当前任务（2026-05-09 418 收到新消息卡顿继续调试）

- [x] 复查当前工作树和已存在改动，确认不走虚拟滚动/拆开读取方向
- [ ] 按固定链路复现并录制“收到新消息”卡顿 trace
- [ ] 基于 trace 收缩 React 渲染与 store 更新扇出
- [ ] 实施最小修复并等待 watch 自动构建生效
- [ ] 做可执行静态校验并回归验证
- [ ] 在本文末尾补充 Review 与后续建议

## 规格

- 用户已明确：重点是 418 房间在大量既有发言时收到新消息极卡。
- 本轮不做虚拟滚动，不做拆开读取/延后回填方案。
- 复现路径按用户补充：先刷新目标房间，再打开并关闭 `chrome://flags`，回房间后触发“规则”或“发送/收到新消息”。
- 以浏览器性能录制为准，只围绕 React 渲染和状态更新扇出做最小修复。

# 当前任务（2026-04-07 发言/筛选卡顿回退重做）

- [x] 复习 `tasks/lessons.md`、现有 Trace 结论与当前工作树改动范围
- [x] 回退当前这条日志卡顿优化线的大部分代码改动，恢复到当前 `HEAD` 基线附近
- [x] 在回退后的基线上重新确认“发送回显卡”和“筛选卡”的最小改动方向
- [x] 实施新方案并运行可执行的静态验证
- [x] 在本文末尾补充 Review，记录回退范围、新方案与剩余风险

## 规格

- 用户已明确否定当前这条优化线，原因是实际体感“更卡了”。
- 本轮不是只回退最近一轮，而是要把这个 git 节点上这条日志卡顿优化线的大部分改动基本回退。
- 新方案必须基于已知 Trace 结论重新选方向，并且尽量少改动，不继续沿用此前的大范围日志结构重写思路。
- 不把虚拟滚动作为主方案，也不把 `contain` 当作主要解决路径。
- 需要同时关注“点击发送后回显那一瞬间卡”与“筛选时卡”，优先寻找共同的根因收缩点。

## Review

- 已将这条日志卡顿优化线的大部分代码改动按文件回退到当前 `HEAD` 基线附近，回退范围包括：
- `client/code/pages/game/game.coffee`
- `front/src/pages/game-view/component.tsx`
- `front/src/pages/game-view/logs/elements.tsx`
- `front/src/pages/game-view/logs/index.tsx`
- `front/src/pages/game-view/logs/log-store.ts`
- `front/src/pages/game-view/logs/log.tsx`
- `front/src/pages/game-view/speak-form/index.tsx`
- `front/src/pages/game-view/store.ts`
- 回退后重新按已知 Trace 热点收缩方向，不再继续沿用“批量 flush + 日志分段 + contain 叠加”的旧方案。
- 发送回显侧，本轮只做了一个稳定边界修复：`LogChunk` 改回按“天”做 `PureComponent`，并让不可见 chunk 在 fixed-size 模式下直接返回空壳容器，避免每次新日志回显都把未变化历史天块再次走一遍 render。
- 筛选侧，本轮没有改交互语义，只把 fixed-size 大日志下的筛选命中点从“每条日志里的多个单元格”收缩成“整行包装器一个节点”；这样点击筛选时需要参与样式匹配和透明度变化的 DOM 数量会显著减少。
- 已顺手补上基线里原本未生效的 `logLineProps` 透传，否则 fixed-size 行级筛选不会真正落到 DOM。
- 已在 `front/` 目录运行 `npm run build:tsc`，通过。
- 本轮仍未重新抓浏览器 Trace；剩余不确定性主要在“单天日志极多”时，当前按天稳定边界是否足够。如果你体感仍明显卡，下一步就该继续收紧到“当前天内部的活跃尾部”，但那会比这次更接近结构性改动。

# 当前任务（2026-04-07 发言卡顿复查）

- [x] 复习 `tasks/lessons.md` 并记录用户纠正
- [x] 梳理“发言时”涉及的输入、发送、回显与日志更新路径
- [x] 识别仍会在发言时触发整页重渲染或重排的热点
- [x] 实现更针对性的修复
- [x] 运行可执行的静态验证并记录结果

## 规格

- 用户反馈上一轮“新消息接收”优化后，发言时仍然非常卡。
- 本轮不能默认根因仍在 socket 接收批量或日志分段上。
- 需要把排查范围扩展到输入组件、发送动作、MobX store 更新、整页 React 重渲染和日志回显。

## Review

- 已把日志总数从按渲染时遍历 `chunks` 计算，改为 store 内维护的可观察计数，并新增 `fixedSize` 计算属性；`Game` 现在只依赖 `fixedSize`，避免在大日志模式下每来一条消息都整页重新 render。
- 已确认上一轮遗漏的关键点之一是：`Game` 会因为 `allLogNumber` 每次递增而持续重渲染，这会把 `Players`、`JobInfo`、规则区等无关区域一起拖进发言回显路径。
- 已把 `SpeakForm` 的输入链路从“每个按键至少两次状态更新 + 一次同步 `localStorage` 写入”收缩成“至多一次状态更新 + 延迟草稿写入”；普通输入时若自动补全状态未变化，不再重复触发隐藏态更新。
- 已在 `front/` 目录重新运行 `npm run build:tsc`，通过。
- 本轮仍未做浏览器 Trace 回归；若你在目标机器上体感仍明显卡，下一步最需要的是区分“打字卡”还是“发送后回显卡”，然后对应补采一份现版本 Trace。

# 当前任务（2026-04-07 发言回显卡顿复查）

- [x] 把用户最新纠正补充到任务与经验记录
- [x] 重新聚焦“点击发送后回显瞬间”的渲染与布局路径
- [x] 检查日志分段是否真正形成稳定 DOM 边界
- [x] 实施只针对回显日志新增路径的最小优化
- [x] 运行可执行的静态验证并记录结果

## 规格

- 用户已明确：不是打字过程卡，而是点击发送后，自己的发言回显到日志里的那一瞬间卡。
- 本轮优先排查日志回显新增时的 React 子树更新范围和浏览器布局传播范围。
- 不采用虚拟滚动，也不把问题重新泛化成“所有新消息场景”。
- 若继续改代码，应优先让未变化历史日志在 DOM 和布局层面都变成稳定边界，而不只是 React 层跳过。

## Review

- 已确认上一轮“分段”主要停留在 React 层：`FixedSizeLogSegment` 虽能跳过未变化历史段的 render，但当时没有真实段容器落到 DOM，浏览器在布局阶段仍把当天日志当作一个扁平流处理。
- 已在 `front/src/pages/game-view/logs/index.tsx` 为固定尺寸模式补上真实的 `FixedSizeSegmentWrapper`，让每 40 条日志形成稳定 DOM 边界；新增回显时，未变化历史段可以作为整块参与位移，而不是重新卷入同一扁平布局流。
- 已在 `front/src/pages/game-view/logs/elements.tsx` 为固定尺寸天块和段块补上 `contain: layout style paint`，并恢复日志包装层与单行的 `contain: layout style`，收缩日志区新增一条消息时的布局脏区传播范围。
- 已根据“点击筛选也会卡”的新反馈继续收缩样式失效范围：固定尺寸日志现在把筛选用的 `.jf-log` 类挂到整行包装节点，而不再挂到每一行内部的多个单元格上，避免一次筛选命中 4 倍以上的节点数量。
- 已在 `front/` 目录重新运行 `npm run build:tsc`，通过。
- 本轮仍未做目标机器的浏览器 Trace 回归，因此“优化幅度”还需要你在问题机上用同一发言场景再验一次；若仍卡，下一步再考虑把固定尺寸日志改成“视觉倒序、DOM 追加”的方案，继续减少回显时的插入成本。

## 补充分析（2026-04-07 新 Trace 根因收缩）

- 新文件 `C:\Users\kl\Desktop\Trace-20260407T111045.json` 已确认不是泛化的“任意操作都卡”，而是至少分成两条不同热点链路。
- 发送一次消息后，socket 回包本身不重；真正重的是 `requestAnimationFrame` 中的日志 flush 回调。Trace 里这段回调约 `39ms`，其中出现了约 `1386` 次 `FixedSizeLogSegment.shouldComponentUpdate`，说明当前 fixed-size 日志在新消息回显时仍会把海量历史段全部走一遍更新检查。
- 点击筛选时，JS 事件处理本身大约只有 `5~6ms`；真正的长任务约 `195ms`，热点集中在 `UpdateLayoutTree ~65ms`、`Layout ~72ms`、`PrePaint ~51ms`，说明筛选卡顿的主因是“大日志 DOM 已经在页面上活着”之后的样式失效与布局/绘制成本。
- 这也说明要同时改善“发送卡”和“筛选卡”，不能继续只加 `contain`；需要分别压掉“发送时的历史段更新遍历”和“筛选时的整片日志样式/布局成本”。

## 补充调整（2026-04-07 基于新 Trace 的实现）

- 已在 `front/src/pages/game-view/logs/index.tsx` 把 fixed-size 段渲染拆成“最新活动段 + 历史段集合”两层；历史段集合用单个组件做 O(1) 范围判断，避免每次发送回显都把上千个 `FixedSizeLogSegment` 逐个调用 `shouldComponentUpdate`。
- 已在 `front/src/pages/game-view/logs/elements.tsx` 将桌面 fixed-size 日志行从逐行 `grid` 改成更轻的 `flex` 行布局，减少大日志场景下每次样式变化或插入时的布局成本。
- 已在 `front/src/pages/game-view/logs/elements.tsx` 把 fixed-size 大日志下的筛选反馈从“全量非命中行降透明”调整为“仅高亮命中行”；这是有意的行为收缩，用来避免一次筛选触发整片日志的样式失效、重排和预绘制。
- 已在 `front/` 目录重新运行 `npm run build:tsc`，通过。

# 当前任务（2026-04-03 新消息卡顿优化尝试）

- [x] 复习旧 Trace 结论与当前实时日志接入路径
- [x] 为实时日志增加批量 flush，减少连续消息的同步提交次数
- [x] 为固定尺寸日志增加稳定分段，缩小新消息更新时的重渲染范围
- [x] 运行可执行的静态验证
- [x] 在本文末尾补充 Review，记录实现点、验证与剩余风险

## 规格

- 本轮改动不采用虚拟滚动。
- 优先命中“新消息到来时”的主线程抖动，不重复扩展到无关 UI。
- 需要同时覆盖数据接入层和日志渲染层，避免只在某一层做表面优化。

## Review

- 已在 `client/code/pages/game/game.coffee` 为实时 `log` socket 事件增加按帧批量 flush；连续到达的日志会先入队，再通过一次 `runInAction` 批量提交到前端 store。
- 已在 `front/src/pages/game-view/logs/log-store.ts` 为每天的日志块维护稳定小段（每段 `40` 条）和段版本号；新消息默认只会影响最后一段。
- 已在 `front/src/pages/game-view/logs/index.tsx` 把固定尺寸日志渲染改为“块内分段 + 段级 shouldComponentUpdate”；未变化的历史段会跳过重新渲染。
- 已在 `front/src/pages/game-view/store.ts` 补充 `addLogs`，让批量 flush 能以一次 action 落到 MobX。
- 已在 `front/` 目录运行 `npm run build:tsc`，通过。
- 已使用本地 CoffeeScript 编译器对 `client/code/pages/game/game.coffee` 做只读编译检查，语法通过。
- 仍未做浏览器实机 Trace 回归；剩余风险主要是日志引用 tooltip、超长单日日志和刷新/补日志同时发生时的真实表现，还需要你在目标 Edge 机器上再抓一份新 Trace 对照。

# 当前任务（2026-04-03 新消息卡顿优化评估）

- [x] 复习 `tasks/lessons.md`、旧 Trace 结论与当前日志相关实现
- [x] 明确本轮约束：不把虚拟滚动作为主方案
- [x] 梳理“新消息到来”路径上的 DOM、React 与布局瓶颈
- [x] 评估不依赖虚拟滚动的可行优化点与风险
- [x] 在本文末尾补充 Review，记录结论与建议优先级

## 规格

- 目标是评估现阶段代码还能优化“新消息更新触发的卡顿”的哪些环节。
- 必须结合旧 Trace 中已经出现过的主线程热点来判断，而不是只做抽象推测。
- 不把虚拟滚动作为推荐主方案，因为用户已明确说明它会把问题转移成滚动卡顿，不能解决根因。
- 结论需要区分“规则面板联动重排”与“新消息到来自身造成的更新成本”。

## Review

- 旧 Trace 显示真正恶化时，热点集中在 `socket.onmessage` 之后的 `Layout`、`UpdateLayoutTree`、`PrePaint` 和 `Commit`，说明根因是“单次消息更新影响面过大”，不是单纯滚动容器大小问题。
- 当前 `HEAD` 已对“规则面板展开牵连日志区重排”做了有效收缩，但实时日志入口仍是每条 socket 日志立即 `store.addLog` 一次；这意味着连续消息仍会触发连续 MobX/React 更新。
- 当前日志数据结构仍只按“天”分块，实时追加时会落到当天的同一个大块里；而当前 `LogChunk` 也不是 `PureComponent`/`memo` 的稳定子树，导致新消息到来时当前天的大块仍可能被整块重新参与渲染与布局。
- 不依赖虚拟滚动的最高优先级优化点应是：
- 其一，实时日志在接入层做批量合并提交，避免一条消息一次同步提交。
- 其二，固定尺寸日志在数据层和渲染层继续细分为稳定小段，只让最后一段随新消息变化。
- 其三，为日志块引入显式版本号或稳定引用，配合 `PureComponent`/`memo` 跳过未变化历史段。
- `content-visibility` 一类方案不是本轮主推荐；它更像补充优化，且存在把成本转移到滚动阶段的风险。

# 当前任务（2026-04-03 任务补档）

- [x] 复习 `tasks/lessons.md`、`tasks/todo.md` 与当前仓库状态，确认可恢复信息
- [x] 检查 `git status`、`git log`，区分已记录历史与不可证明内容
- [x] 补充 `tasks/todo.md` 当前有效上下文，保留既有历史记录
- [x] 补充 `tasks/lessons.md` 恢复类任务的经验规则
- [x] 复查补档结果并在本文末尾记录 Review

## 规格

- 本次补档不能凭空捏造不存在的工作记录。
- 应优先以当前工作树、`tasks` 现有内容与 git 历史为准恢复上下文。
- 应保留已存在的历史任务记录，只补充“恢复说明”和当前仍有效的协作信息。
- 需要把后续继续协作时最关键的待验证事项重新落档。

## 当前有效上下文

- 目前最近两条已完成主线仍是“老骑士职业补充”和“日志区卡顿/Edge 兼容性排查”，详细过程见下方历史记录。
- 当前工作树干净，`tasks/todo.md` 与 `tasks/lessons.md` 没有额外未提交改动；可视为这次补档的可信基线。
- “老骑士”相关剩余风险仍是实机对局内验证“守护成功后次晨老死”的完整表现。
- “日志区卡顿”相关剩余风险仍是特定 Edge/机器组合下的实机表现，以及规则面板覆盖层和渐进补日志的交互细节。
- 当前前端验证约束仍然成立：不要为了验证切回低版本 Node，优先在当前 Node 环境下完成可执行的静态检查，并把旧打包链兼容性单独说明。

## Review

- 已基于当前 `tasks` 文件、干净工作树与最近提交历史完成补档，未重写或覆盖既有任务记录。
- 已把“当前有效上下文”和“仍需后续人工验证的风险”重新写回本文件，便于后续继续协作。
- 本次补档只能恢复仓库中仍可证明的内容；若还有某段特定任务丢失，但仓库与 git 都没有痕迹，需要按具体主题再补。

# 当前任务

- [x] 复习 `tasks/lessons.md` 与现有任务记录，确认相关约束
- [x] 定位“猎人”“老人”“守护成功”的实现入口
- [x] 为“老骑士”补充职业定义、规则说明与文案映射
- [x] 实现“守护成功后次晨老死”的服务端行为
- [x] 校验前端构建或相关静态检查
- [x] 在本文末尾补充 Review，记录验证结果与风险

## 规格

- 新职业名为“老骑士”。
- 基本行为与“猎人”一致，复用猎人的守护机制与限制。
- 当老骑士发生一次有效守护成功后，应参考“老人”在早晨老衰死亡。
- 老衰死亡应发生在早晨结算，不应在夜间即时死亡。

## Review

- 已新增“老骑士”职业，服务端实现为继承“猎人（Guard）”的守护职业，并在成功守护后记录次日白天的老衰死亡标记。
- 已将“老骑士”接入职业列表、村人阵营、护卫系规则分组、前端表单文案与职业说明页。
- 已在 `front/` 目录下使用 `node 8.17.0` 运行 `npm run production-build`，构建通过。
- 已使用本地 CoffeeScript 编译器对 `server/rpc/game/game.coffee` 做语法检查，检查通过。
- 尚未启动完整游戏流程做人工对局验证；剩余风险主要在复合状态与特殊守护交互，需要在实际房间内再验一次“守护成功后次晨老死”的表现。

---

# 当前任务（2026-04-02 日志区卡顿）

- [x] 复习 `tasks/lessons.md` 与现有任务记录，确认相关约束
- [x] 定位 `fixedSize` 日志区与“规则”按钮的实现路径
- [x] 重构 `fixedSize` 日志渲染结构，降低新消息插入时的整体重排范围
- [x] 调整“规则”面板打开方式，避免通过布局动画挤压日志区域
- [x] 运行前端构建验证
- [x] 在本文末尾补充 Review，记录根因、验证结果与剩余风险

## 规格

- 问题聚焦于部分设备、部分浏览器在游戏页日志区出现的严重主线程卡顿。
- 卡顿主要发生在 `fixedSize` 日志区域收到新消息时，以及点击“规则”按钮展开规则面板时。
- 修复应优先针对浏览器布局、重排、重绘路径本身，而不是只做表面样式调参。
- 需要尽量减少大批量日志节点在新增消息或展开规则面板时同时参与布局计算的机会。
- 需要保留现有日志内容、规则面板和基础交互能力，不引入破坏性功能回退。

## Review

- 已按“最小改动”方向收缩实现：`fixedSize` 日志区仅保留“分段容器 + 行容器”的结构修复，每 40 条日志包进一个稳定段容器，减少新消息到来时大量同级日志节点同时重排的范围。
- 额外的 `content-visibility` 与 `contain-intrinsic-size` 优化已回退，只保留日志分段所需的最小布局隔离。
- 已将 `LogChunk` 改为 `React.PureComponent`，并新增 `FixedSizeLogSegment` 作为 `PureComponent`，减少新日志到来时对未变化日志块的 React 重新渲染。
- 已把手机端“规则”面板从挤压日志区的布局动画改成固定覆盖层 + `transform` 动画，避免点击“规则”时持续改变日志区可用宽度。
- 已把规则面板打开后的 `scrollIntoView` 改到 `requestAnimationFrame`，避免“切换面板 + 同步滚动”落在同一个强制布局时机。
- 已移除 `ShowRule` 里的调试 `console.log`，避免规则面板展开时附带无意义的主线程噪音。
- 已记录新的环境约束到 `tasks/lessons.md`：后续验证不再切换到低版本 Node，优先遵循用户指定的当前 Node 环境。
- 在当前 `Node v24.13.0 / npm 11.6.2` 环境下，`front` 的 `tsc` 已通过，说明当前这版最小改动的 TypeScript 代码本身可编译。
- 当前 Node 24 无法直接兼容仓库里的旧 `webpack 4` 打包链，`--openssl-legacy-provider` 也不可再用，因此这轮未对“收缩后的最终版本”重新完成完整 bundle 验证。
- 已观察到 `client/static/front-assets/` 中存在此前生成的完整前端产物，但它们不能作为这次“最小收缩版”改动的最终构建证明。
- 仍未做浏览器实机复现验证；剩余风险主要在超长日志房间下的真实卡顿改善幅度，以及手机端规则覆盖层与现有手势/滚动交互的细节表现。

## 补充调整（2026-04-03 日志加载慢）

- 发现当前日志“进入页面后加载慢、滚到底才开始补日志”的直接原因，主要是 `logs/store.ts` 里只渲染首批 50 条，并且后续完全依赖 `requestIdleCallback` 空闲时机推进。
- 已把首批渲染数从 50 提高到 150，把每轮补渲染数量从 100 提高到 200，减少首屏与首次滚动时的等待感。
- 已为 `requestIdleCallback` 增加 `timeout: 120`，避免在滚动、动画或主线程较忙时长期拿不到空闲机会。
- 已根据 `deadline.timeRemaining()` / `didTimeout` 动态提高单轮补渲染批次，避免日志只能极慢地一小段一小段补出来。
- 已在当前 Node 24 环境下重新运行 `front` 的 `npm run build:tsc`，通过。

## 影响范围评估

- 改动只落在游戏页前端，不涉及服务端、存档、日志协议或房间外页面。
- 日志相关改动只会在日志条数超过 `maxLogsInGrid = 500` 后生效；低日志量房间仍走原本路径。
- “规则”面板相关改动主要影响手机端打开规则面板时的布局方式；桌面端仍保留侧栏布局。
- 当前改动没有变更日志内容、排序、过滤、引用、发言发送与规则数据本身。

## 最小改动建议

- 若以“最小改动”优先，建议保留两条直接命中卡死触发链的修改：
- 其一是 `fixedSize` 日志分段，解决“新消息到来时整串日志一起重排”。
- 其二是手机端规则面板覆盖层化，解决“点击规则时通过宽度/边距动画挤压大日志区”。
- `requestAnimationFrame` 延后 `scrollIntoView` 与移除规则面板调试日志属于低风险小修，可保留。
- `content-visibility` / `contain-intrinsic-size` 属于额外优化，不是最小闭环的必要条件；若后续想进一步收缩改动，可优先考虑回退这两项，只保留日志分段与规则覆盖层。

## 补充分析（2026-04-03 about-gpu 对照）

- 已对比桌面两份 Edge `about-gpu` 导出：
- 问题机：`about-gpu-2026-04-03T03-39-08-783Z.txt`
- 正常机：`about-gpu-2026-04-03T03-38-05-237Z.txt`
- 两边操作系统一致，GPU 加速、ANGLE D3D11、Direct Composition、Overlay、Partial Raster 等主路径表面上一致，因此问题不像是“是否开启硬件加速”这种粗粒度开关造成。
- 问题机最可疑的差异是 Chromium 将同一张 `GTX 1660 SUPER` 枚举成了多个独立 GPU 适配器：`GPU0/GPU1/GPU2` 都是同型号但 LUID 不同；对应的 Dawn 后端条目也明显重复，导出文件体积约 `70358` 字节，显著大于正常机的 `48856` 字节。
- 正常机只枚举到一个离散 GPU：`RTX 4070`，Dawn 后端条目为常规的一组 D3D12 / Vulkan / D3D11。
- 问题机显示链路也更激进：`2560x1440 + scale=1.5 + 60Hz`；正常机是 `1920x1080 + scale=1 + 165Hz`。从设备像素角度看，问题机的实际栅格化目标接近 `3840x2160`，像素量约为正常机的 4 倍，更容易放大大文本区重排与重绘成本。
- 当前判断：更像是“问题机 Chromium 的 GPU/显示适配器枚举异常或更复杂”叠加“1.5 缩放下的大面积文本重排”，而不是 Win10/Win11 或单纯浏览器版本差异。
- 这也符合用户现象：同样 Chromium 内核并不能稳定复现，真正触发条件更接近某些机器上的特定图形链路、驱动状态、浏览器实现分支与页面布局组合。

## 补充验证（2026-04-03 再排除）

- 已让问题机把系统显示缩放从 `150%` 调整后复测，问题仍然存在，因此“分数缩放本身”不能单独解释卡死。
- 已让问题机关闭 Edge 硬件加速后复测，问题仍然存在，因此“GPU 硬件加速路径本身”也不是唯一根因。
- 已确认无痕窗口中仍可稳定复现，因此常规浏览器扩展、用户 profile 缓存、同步配置不再是优先怀疑对象。
- 从用户提供的 `edge://accessibility` 截图看，当前没有看到 `Web accessibility`、`Screen reader` 等明显开启迹象；至少现阶段没有证据表明是可访问性树被强制打开导致的卡死。
- 结合这两个结果，问题方向需要从“单纯 GPU/缩放导致的重绘问题”进一步收缩到“浏览器主线程上的 DOM 变更、布局、可访问性树更新、浏览器注入脚本或特定浏览器实现差异”。

## 补充调整（2026-04-03 最小兼容补丁第二轮）

- 已在 `logs/store.ts` 中加入 `pause/resume` 能力；当高风险场景出现时，可以暂停渐进补日志，避免“规则面板切换”和“后台批量补日志”同时争用主线程。
- 已在 `Logs` 组件接入 `pauseRendering`，并在 `fixedSize` 日志且规则面板展开时暂停补日志。
- 已将 `LogChunk` 改为 `React.PureComponent`，并把 `fixedSize` 日志继续切成每 `40` 条一个稳定段容器，缩小新消息到来时的 DOM 更新和布局传播范围。
- 已把规则面板切换动画在 `fixedSize` 大日志场景下直接关闭，同时把 `scrollIntoView` 延后到 `requestAnimationFrame`，避免点击“规则”时叠加连续布局动画与同步滚动。
- 已把规则面板在 `fixedSize` 大日志场景下进一步改为覆盖层模式，使其不再参与日志区域的宽度分配；即便打开规则面板，日志区本身也不再因为侧栏展开而发生整体 reflow。
- 已在当前 Node 24 环境下重新运行 `front` 的 `npm run build:tsc`，通过。

## 补充分析（2026-04-03 新问题机 about-gpu）

- 新导出文件：`about-gpu-2026-04-03T03-48-57-815Z.txt`。
- 这份导出比前两份更可疑，不只是“机器不同”，而是浏览器 GPU 路径本身被明显改过：
- 其中 `Command Line` 中的显式 flag 已被用户确认只是排查时临时加上的测试设置，不能作为根因结论。
- 因此这份导出里与根因更相关的仍是默认环境外也成立的客观事实，而不是 `SkiaGraphite` / `zero-copy` 这类测试参数本身。
- 设备枚举非常复杂：同时出现重复的 Intel Xe 与 RTX 4060 Laptop GPU 条目，Dawn backend 总条目达到 `14` 个，明显高于之前问题机的 `10` 个和正常机的 `6` 个。
- 显示链路也更复杂：双屏，且 DPI 不一致，分别是 `1920x1080@240Hz scale=1` 的内屏与 `2048x1152@250Hz scale=1.25` 的外屏。
- 初始化时间高达 `503ms`，进一步说明浏览器 GPU 初始化与设备枚举链路偏重。
- 当前优先判断：在忽略测试 flag 之后，这台机器最可疑的仍是“多适配器重复枚举 + 混合显卡 + 双屏高刷/混合缩放链路”，而不是系统版本本身。

## 补充分析（2026-04-03 同机浏览器对照）

- 用户新增了 `没问题的/huaweibrowser.txt`，这让同一台 `RTX 4060 Laptop GPU + Intel Xe + 双屏高刷/混合缩放` 机器出现了直接对照样本。
- 正常样本 `huaweibrowser.txt` 与问题样本 `about-gpu-2026-04-03T03-48-57-815Z.txt` 在硬件拓扑上高度一致：
- 都是同一套 `NVIDIA RTX 4060 Laptop GPU + Intel Xe` 组合。
- 都出现了重复 GPU 枚举。
- 都是双屏，且显示参数同样是 `1920x1080@240Hz scale=1` 加 `2048x1152@250Hz scale=1.25`。
- 两边 `Direct composition`、`Supports overlays` 也都为 `true`，初始化时间量级接近（约 `438ms` 对 `503ms`）。
- 这说明“复杂显卡/显示链路”本身不是充分条件；它更像是放大器，而不是单独根因。
- 现阶段更强的结论是：真正触发卡死的，是 Edge 这一侧较新的 Chromium/Edge 渲染实现，与我们当前页面里的“大日志 DOM 变更 + 规则面板切换”组合撞上了病理路径。
- 同样的结论在另一组样本上也有迹象：`问题设备/hwbrowser.txt` 与 `about-gpu-2026-04-03T08-02-45-227Z.txt` 共享同一台 `Intel UHD + RTX 4060 Laptop` 机器，但华为浏览器侧没有看到比 Edge 更糟的 GPU 初始化或崩溃迹象。

# 当前任务（2026-04-07 mcp-chrome 安装与修复）

- [x] 复习 `tasks/lessons.md`、现有任务记录和本机 `Codex` MCP 配置
- [x] 定位 `mcp-chrome` 当前启动报错的直接原因
- [ ] 修正 `mcp-chrome` 的本机安装/启动配置
- [ ] 做本地冒烟验证并补充 Review

## 规格

- 目标是让当前 `Codex` 能正常识别并启动 `mcp-chrome` MCP 服务。
- 需要先区分“包未安装”和“配置错误”两类问题，避免无意义重装。
- 若本机已存在可用的 `mcp-chrome-bridge`，优先最小改动修复启动命令。
- 修复后至少验证一次启动链路，确认不再出现当前的 `npx node ...` 误调用问题。
# 当前任务（2026-05-11 React 依赖升级评估与尝试）

- [x] 盘点当前前端依赖版本与兼容边界（React/MobX/styled-components/TS/webpack）
- [ ] 给出可升级区间评估（16.14 / 17 / 18）与风险结论
- [ ] 尝试实施最低风险升级并更新锁文件
- [ ] 运行可执行静态校验并记录结果
- [ ] 在本文末尾补充 Review 与后续建议

## 规格

- 用户要求评估“是否 React 旧版导致卡顿”，并在可行时尝试升级。
- 本轮优先最小风险路径：同代升级（React 16.8 -> 16.14）先落地验证。
- 若评估显示 17/18 可行，也需要明确列出必须改造点与风险，不做口头结论。

# 当前任务（2026-06-02 新 trace 定位日志区卡顿）

- [x] 读取 `Trace-20260602T183405.json` 并统计长任务、线程、事件类别
- [x] 对照日志区相关代码判断是否仍是既有 pickup/hover/style 方向
- [x] 给出进一步根因判断、验证路径和是否需要改方案

## 规格

- 本轮先分析，不直接改代码。
- 重点判断现有提交为何不能解决，以及新的 trace 是否暴露了更高概率的问题节点。

## Review

- `Trace-20260602T183405.json` 最大事件是 `Browser / CrBrowserMain / RunTask`，耗时约 `7563.9ms`，事件本身没有可见业务 JS 子调用栈。
- 这次 renderer 主线程的主要长事件是 `RunTask 368.0ms / 289.9ms`、`Layout 154.1ms / 104.3ms`、`Commit 146.3ms / 77.1ms`、`PrePaint 83.4ms / 79.5ms`，不足以解释整段 7.5 秒冻结。
- 录制窗口内 DOM 规模固定在约 `71697` 节点，JS listener 计数约 `16332-16345`，JS heap 约 `52.4-52.9MB`。
- 与旧 trace 对照：`Trace-problem.json` 约 `36429` 节点/`8750` listener 时已出现 `Browser UpdateLayer 8262.5ms`；`Trace-20260601T220616.json` 约 `25846` 节点/`5960` listener 时出现 `Browser RunTask 3707.1ms`。
- 当前结论：现有 pickup/hover/样式选择器优化只能减少放大器，不能解决根因；更高概率根因是日志区全量 DOM/React 对象/监听器规模触发部分 Chromium/设备的浏览器进程合成、输入或内部树维护退化。
- 未发现磁盘 IO、资源加载或图片解码成为秒级主因的 trace 证据；图片解码最大约 `13.7ms`，主线程 GC 最大约 `6.8ms`，后台 GC/CppGC 最大约 `35.9ms`。

# 当前任务（2026-06-02 日志 DOM 深层瘦身计划）

- [x] 反复推敲不改变玩家可见样式的优化计划
- [x] 盘点普通发言、引用节点、名称节点、时间/图标节点的 DOM 与交互成本
- [x] 设计可分提交、可回退、可 trace 验证的实施顺序
- [x] 用户确认计划后再开始代码改动
- [x] 恢复玩家工具图标 hover 视觉行为
- [x] 将日志引用 tooltip 从每引用组件状态改为单例懒解析
- [x] 将日志短 ID 双击从每行 hook 改为模块级轻量分发
- [x] 运行 TypeScript 静态验证

## 规格

- 不接受虚拟滚动，不改变滚动条真实感知。
- 不改变显示样式；至少玩家肉眼看不出变化，并尽量避开已知样式变动。
- 优先从单条日志 DOM 节点数、组件数、事件/Hook 数、引用节点交互模型这些更深层位置优化。
- 每个阶段都必须能单独回退，并能用 DOM nodes、JS listeners、Browser 主线程长任务、renderer Layout/Commit/PrePaint 指标验证。

## Review

- 评估此前 3 个未 push 代码提交后，保留 `pickup` 固定 class 与删除冗余 `data-userid`，因为它们无可见样式变化且不妨碍深层优化。
- 恢复玩家工具图标 `hover` 透明度变化与 `transition`，因为移除它会造成可见行为变化，不符合“玩家看不出来”的约束。
- 日志引用节点现在仍显示同样的 `>>shortId` / `>>shortId:玩家名`、同样的下划线样式和 title；tooltip 内容改为点击时按 shortId 懒解析，不再让每个引用组件持有 `msg`、state、effect、portal。
- 名字和时间上的 shortId 双击行为保留，但取消每个名字/时间实例自己的 `useDoubleClick` hook，改为模块级双击状态分发。
- 已运行 `front` 目录 `npm run build:tsc`，通过。
