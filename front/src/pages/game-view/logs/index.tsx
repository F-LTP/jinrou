import * as React from 'react';
import { observer } from 'mobx-react';
import { Log, LogVisibility, maxLogsInGrid } from '../defs';
import { Rule } from '../../../defs';

import { LogModeStyle, OneLog } from './log';
import { StoredLog, LogStore } from './log-store';
import { mapReverse } from '../../../util/map-reverse';
import { I18n, TranslationFunction } from '../../../i18n';
import {
  LogWrapper,
  FixedSizeChunkWrapper,
  LogBlockWrapper,
  PendingLogMessage,
} from './elements';
import { LogsRenderingState } from './store';

const logsInBlock = 100;

interface LogBlockData {
  firstLogId: number;
  lastLogId: number;
  logs: StoredLog[];
}

interface LogBlockCache {
  length: number;
  blocks: LogBlockData[];
}

const logBlockCache = new WeakMap<StoredLog[], LogBlockCache>();

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

function cssString(value: string): string {
  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\A ')
    .replace(/\r/g, '\\D ')}"`;
}

function PickupStyle({ pickup }: { pickup: string | null }) {
  if (pickup == null) {
    return null;
  }
  return (
    <style>
      {`.jf-log-list[data-log-pickup-active="true"] .jf-log[data-log-userid]:not([data-log-userid=${cssString(
        pickup,
      )}]){opacity:0.3;}`}
    </style>
  );
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
      <>
        <LogModeStyle />
        <PickupStyle pickup={logPickup} />
        <LogWrapper
          className="jf-log-list"
          fixedSize={fixedSize}
          data-log-pickup-active={logPickup != null ? 'true' : undefined}
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
      </>
    );
  }
}

/**
 * Show chunk of logs.
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
        {t =>
          mapReverse(splitLogsIntoBlocks(logsToRender), block => (
            <LogBlock
              key={`${block.firstLogId}-${block.lastLogId}`}
              logClass={logClass}
              logs={block.logs}
              fixedSize={fixedSize}
              t={t}
              rule={rule}
              icons={icons}
              resolveLogById={resolveLogById}
              onShortIdClick={onShortIdClick}
            />
          ))
        }
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

function splitLogsIntoBlocks(logs: StoredLog[]): LogBlockData[] {
  const cached = logBlockCache.get(logs);
  if (cached != null && cached.length === logs.length) {
    return cached.blocks;
  }
  const previousBlocks = cached != null ? cached.blocks : [];
  const blocks: LogBlockData[] = [];
  for (let i = 0; i < logs.length; i += logsInBlock) {
    const previous = previousBlocks[Math.floor(i / logsInBlock)];
    const end = Math.min(i + logsInBlock, logs.length);
    const canReuse =
      previous != null &&
      previous.logs.length === end - i &&
      previous.logs[0] === logs[i] &&
      previous.logs[previous.logs.length - 1] === logs[end - 1];
    const blockLogs = canReuse ? previous.logs : logs.slice(i, end);
    if (blockLogs.length > 0) {
      blocks.push({
        firstLogId: blockLogs[0].logid,
        lastLogId: blockLogs[blockLogs.length - 1].logid,
        logs: blockLogs,
      });
    }
  }
  logBlockCache.set(logs, {
    length: logs.length,
    blocks,
  });
  return blocks;
}

class LogBlock extends React.PureComponent<{
  /**
   * Class attached to each log.
   */
  logClass: string;
  /**
   * Logs in this block.
   */
  logs: StoredLog[];
  /**
   * Whether logs are rendered in fixed-size mode.
   */
  fixedSize: boolean;
  /**
   * Translation function.
   */
  t: TranslationFunction;
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
}> {
  public render() {
    const {
      logClass,
      logs,
      fixedSize,
      t,
      rule,
      icons,
      resolveLogById,
      onShortIdClick,
    } = this.props;
    return (
      <LogBlockWrapper $fixedSize={fixedSize}>
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
      </LogBlockWrapper>
    );
  }
}
