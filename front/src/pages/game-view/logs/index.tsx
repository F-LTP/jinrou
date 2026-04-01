import * as React from 'react';
import { observer } from 'mobx-react';
import { Log, LogVisibility, maxLogsInGrid } from '../defs';
import { Rule } from '../../../defs';

import { OneLog } from './log';
import { StoredLog, LogStore } from './log-store';
import { mapReverse } from '../../../util/map-reverse';
import { I18n, TranslationFunction } from '../../../i18n';
import {
  LogWrapper,
  FixedSizeChunkWrapper,
  PendingLogMessage,
} from './elements';
import { LogsRenderingState } from './store';
import { toJS } from 'mobx';

export interface IPropLogs {
  /**
   * All logs.
   */
  logs: LogStore;
  /**
   * Visibility of logs.
   */
  visibility: LogVisibility;
  /**
   * Picked-up user id.
   */
  logPickup: string | null;
  /**
   * Icons of users.
   */
  icons: Record<string, string | undefined>;
  /**
   * Current rule setting.
   */
  rule: Rule | undefined;
  /**
   * Callback for resetting log pickup filter (triggered by double-click).
   */
  onResetLogPickup(): void;
  /**
   * Callback for shortId click.
   */
  onShortIdClick?: (shortId: string) => void;
}

export interface IStateLogs {
  renderingState: LogsRenderingState;
  /**
   * Double-click detection state for resetting log pickup.
   */
  doubleClickState: {
    lastClickTime: number;
    clickTimeout: NodeJS.Timeout | null;
  };
}

/**
 * Shows all logs.
 */
@observer
export class Logs extends React.Component<IPropLogs, IStateLogs> {
  /**
   * Classname attached to each log.
   */
  private readonly logClass = 'jf-log';
  constructor(props: IPropLogs) {
    super(props);
    this.state = {
      // what if logs is updated?
      // (getDerivedStateFromProps)
      renderingState: new LogsRenderingState(this.props.logs),
      doubleClickState: {
        lastClickTime: 0,
        clickTimeout: null,
      },
    };
  }
  public componentDidUpdate(prevProps: IPropLogs) {
    if (!prevProps.logs.loaded && this.props.logs.loaded) {
      this.state.renderingState.reset(this.props.logs.allLogNumber);
    }
  }
  public componentWillUnmount() {
    this.state.renderingState.dispose();
    // Clear timeout if exists
    if (this.state.doubleClickState.clickTimeout) {
      clearTimeout(this.state.doubleClickState.clickTimeout);
    }
  }

  /**
   * Resolve log by shortId for reply reference.
   * This is a performance-optimized lookup using the shortId index.
   * Returns the StoredLog object directly to avoid JSON serialization overhead.
   */
  private resolveLogById = (shortId: string): StoredLog | null => {
    return this.props.logs.findByShortId(shortId);
  };

  /**
   * Handle click for double-click detection to reset log pickup.
   * This is compatible with both desktop and mobile devices.
   */
  private handleLogWrapperClick = () => {
    const now = Date.now();
    const { lastClickTime, clickTimeout } = this.state.doubleClickState;
    const timeDiff = now - lastClickTime;
    const delay = 300;

    if (timeDiff < delay && timeDiff > 0) {
      // Double-click detected
      this.props.onResetLogPickup();
      this.setState({
        doubleClickState: {
          lastClickTime: 0,
          clickTimeout: null,
        },
      });
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    } else {
      // Potential single-click, wait for second click
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
      const newTimeout = setTimeout(() => {
        this.setState({
          doubleClickState: {
            lastClickTime: 0,
            clickTimeout: null,
          },
        });
      }, delay);
      this.setState({
        doubleClickState: {
          lastClickTime: now,
          clickTimeout: newTimeout,
        },
      });
    }
  };

  public render() {
    const {
      logs,
      rule,
      icons,
      visibility,
      logPickup,
      onResetLogPickup,
      onShortIdClick,
    } = this.props;
    const { renderingState } = this.state;

    if (!logs.loaded) {
      return null;
    }

    const fixedSize = logs.allLogNumber > maxLogsInGrid;
    /*
     * number of logs to render (not pending).
     */
    const renderedLogs = logs.allLogNumber - renderingState.pendingLogNumber;

    let renderedLogCount = 0;
    return (
      <LogWrapper
        logPickup={logPickup}
        logClass={this.logClass}
        fixedSize={fixedSize}
        onClick={this.handleLogWrapperClick}
      >
        {mapReverse(logs.chunks, (chunk, i) => {
          // Decide whether this chunk should be shown.
          const visible =
            visibility.type === 'all' ||
            (visibility.type === 'today'
              ? i === logs.chunks.length - 1
              : chunk.day === visibility.day);

          // number of logs in this chunk
          // which should be rendered.
          const chunkRenderedLogs = Math.max(
            0,
            Math.min(chunk.logs.length, renderedLogs - renderedLogCount),
          );
          renderedLogCount += chunk.logs.length;
          return (
            <LogChunk
              key={chunk.day}
              logClass={this.logClass}
              logs={chunk.logs}
              renderedNumber={chunkRenderedLogs}
              visible={visible}
              fixedSize={fixedSize}
              icons={icons}
              rule={rule}
              resolveLogById={this.resolveLogById}
              onShortIdClick={onShortIdClick}
            />
          );
        })}
        {renderingState.pendingLogNumber > 0 ? (
          <PendingLogMessage>正在读取...</PendingLogMessage>
        ) : null}
      </LogWrapper>
    );
  }
}

/**
 * Show chunk of logs.
 * PureComponent: when a new message arrives in the last chunk,
 * all other chunks skip re-rendering entirely.
 */
class LogChunk extends React.PureComponent<
  {
    /**
     * Class attached to each log.
     */
    logClass: string;
    /**
     * Logs to render.
     */
    logs: StoredLog[];
    /**
     * Whether this chunk is visible.
     */
    visible: boolean;
    /**
     * Whether logs are rendered in fixed-size mode.
     */
    fixedSize: boolean;
    /**
     * Number of logs to render.
     */
    renderedNumber: number;
    /**
     * Icon of each user.
     */
    icons: Record<string, string | undefined>;
    /**
     * Current rule.
     */
    rule: Rule | undefined;
    /**
     * Function to resolve log by shortId for reply reference.
     */
    resolveLogById?: (shortId: string) => StoredLog | null;
    /**
     * Callback for shortId click.
     */
    onShortIdClick?: (shortId: string) => void;
  },
  {}
> {
  public render() {
    const {
      logClass,
      logs,
      visible,
      fixedSize,
      renderedNumber,
      rule,
      icons,
      resolveLogById,
      onShortIdClick,
    } = this.props;
    if (!visible && !fixedSize) {
      return null;
    }
    const logsToRender =
      renderedNumber >= logs.length
        ? logs
        : renderedNumber > 0
        ? logs.slice(-renderedNumber)
        : [];

    const chunkContent = (
      <I18n namespace="game_client">
        {t => (
          <LogChunkInner
            logsToRender={logsToRender}
            t={t}
            logClass={logClass}
            fixedSize={fixedSize}
            rule={rule}
            icons={icons}
            resolveLogById={resolveLogById}
            onShortIdClick={onShortIdClick}
          />
        )}
      </I18n>
    );
    if (fixedSize) {
      return (
        <FixedSizeChunkWrapper visible={visible}>
          {chunkContent}
        </FixedSizeChunkWrapper>
      );
    } else {
      return chunkContent;
    }
  }
}

/**
 * Sub-chunk size for content-visibility rendering.
 */
const SUB_CHUNK_SIZE = 100;

/**
 * Inner content of LogChunk.
 * Splits large log arrays into sub-chunks with content-visibility.
 */
class LogChunkInner extends React.Component<{
  logsToRender: StoredLog[];
  t: TranslationFunction;
  logClass: string;
  fixedSize: boolean;
  rule: Rule | undefined;
  icons: Record<string, string | undefined>;
  resolveLogById: ((shortId: string) => StoredLog | null) | undefined;
  onShortIdClick: ((shortId: string) => void) | undefined;
}> {
  public render() {
    const {
      logsToRender,
      t,
      logClass,
      fixedSize,
      rule,
      icons,
      resolveLogById,
      onShortIdClick,
    } = this.props;

    // Small chunks: render directly without sub-chunking
    if (logsToRender.length <= SUB_CHUNK_SIZE) {
      return (
        <>
          {mapReverse(logsToRender, log => (
            <OneLog
              key={log.logid}
              t={t}
              logClass={logClass}
              fixedSize={fixedSize}
              log={log}
              rule={rule}
              icons={icons}
              resolveLogById={resolveLogById}
              onShortIdClick={onShortIdClick}
            />
          ))}
        </>
      );
    }

    // Build sub-chunks in original order for stable keys, then reverse
    const subChunks: { logs: StoredLog[]; key: number }[] = [];
    for (let i = 0; i < logsToRender.length; i += SUB_CHUNK_SIZE) {
      const sub = logsToRender.slice(i, i + SUB_CHUNK_SIZE);
      subChunks.push({ logs: sub, key: sub[0].logid });
    }
    const reversed = subChunks.slice().reverse();

    return (
      <>
        {reversed.map(({ logs: subLogs, key }) => (
          <LogSubChunk
            key={key}
            logs={subLogs}
            t={t}
            logClass={logClass}
            fixedSize={fixedSize}
            rule={rule}
            icons={icons}
            resolveLogById={resolveLogById}
            onShortIdClick={onShortIdClick}
          />
        ))}
      </>
    );
  }
}

/**
 * Sub-chunk with CSS content-visibility.
 * Browser skips layout/paint for off-screen sub-chunks.
 * shouldComponentUpdate skips t comparison (functionally identical).
 */
class LogSubChunk extends React.PureComponent<{
  logs: StoredLog[];
  t: TranslationFunction;
  logClass: string;
  fixedSize: boolean;
  icons: Record<string, string | undefined>;
  rule: Rule | undefined;
  resolveLogById?: (shortId: string) => StoredLog | null;
  onShortIdClick?: (shortId: string) => void;
}> {
  public shouldComponentUpdate(nextProps: LogSubChunk['props']) {
    const cur = this.props;
    const next = nextProps;
    // Skip t — same namespace, functionally identical
    if (
      cur.logClass !== next.logClass ||
      cur.fixedSize !== next.fixedSize ||
      cur.rule !== next.rule ||
      cur.icons !== next.icons ||
      cur.resolveLogById !== next.resolveLogById ||
      cur.onShortIdClick !== next.onShortIdClick
    ) {
      return true;
    }
    if (cur.logs === next.logs) {
      return false;
    }
    if (cur.logs.length !== next.logs.length) {
      return true;
    }
    return (
      cur.logs[0] !== next.logs[0] ||
      cur.logs[cur.logs.length - 1] !== next.logs[next.logs.length - 1]
    );
  }

  public render() {
    const {
      logs,
      t,
      logClass,
      fixedSize,
      rule,
      icons,
      resolveLogById,
      onShortIdClick,
    } = this.props;
    const estimatedHeight = Math.max(100, logs.length * 30);
    return (
      <div
        style={
          {
            contentVisibility: 'auto',
            containIntrinsicSize: `0 ${estimatedHeight}px`,
          } as React.CSSProperties
        }
      >
        {mapReverse(logs, log => (
          <OneLog
            key={log.logid}
            t={t}
            logClass={logClass}
            fixedSize={fixedSize}
            log={log}
            rule={rule}
            icons={icons}
            resolveLogById={resolveLogById}
            onShortIdClick={onShortIdClick}
          />
        ))}
      </div>
    );
  }
}
