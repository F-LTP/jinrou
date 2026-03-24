import * as React from 'react';
import { observer } from 'mobx-react';
import { Log, LogVisibility, maxLogsInGrid } from '../defs';
import { Rule } from '../../../defs';
import { TranslationFunction } from '../../../i18n';

import { OneLog } from './log';
import { StoredLog, LogStore } from './log-store';
import { mapReverse } from '../../../util/map-reverse';
import { I18n } from '../../../i18n';
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
      <>
        {/* Dynamic filter styles - avoids styled-components re-generation */}
        {logPickup != null && (
          <style>
            {`.${this.logClass}:not([data-userid="${logPickup}"]) { opacity: 0.3; }`}
          </style>
        )}
        <LogWrapper
          logClass={this.logClass}
          className={fixedSize ? 'fixed-size' : ''}
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
                version={chunk.version}
                renderedNumber={chunkRenderedLogs}
                visible={visible}
                fixedSize={fixedSize}
                icons={icons}
                rule={rule}
                resolveLogById={this.resolveLogById}
                onShortIdClick={onShortIdClick}
                logPickup={logPickup}
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
 * Optimized with React.memo to prevent unnecessary re-renders.
 */
interface ILogChunkProps {
  /**
   * Class attached to each log.
   */
  logClass: string;
  /**
   * Logs to render.
   */
  logs: StoredLog[];
  /**
   * Version number that increments when logs are added.
   * Used for efficient React.memo comparison.
   */
  version: number;
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
  /**
   * ID of user currently picked up for filtering.
   */
  logPickup?: string | null;
}

const LogChunkContent = React.memo<
  Omit<ILogChunkProps, 'version'> & { t: TranslationFunction }
>(
  ({
    t,
    logClass,
    logs,
    visible,
    fixedSize,
    renderedNumber,
    rule,
    icons,
    resolveLogById,
    onShortIdClick,
    logPickup,
  }) => {
    // Use useMemo to cache logsToRender calculation
    const logsToRender = React.useMemo(() => {
      if (renderedNumber >= logs.length) {
        return logs;
      }
      if (renderedNumber > 0) {
        return logs.slice(-renderedNumber);
      }
      return [];
    }, [logs, renderedNumber]);

    // Early return if not visible and not fixed size
    if (!visible && !fixedSize) {
      return null;
    }

    return (
      <>
        {mapReverse(logsToRender, log => {
          return (
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
              logPickup={logPickup}
            />
          );
        })}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Primary check: logs array length change (new log added)
    if (prevProps.logs.length !== nextProps.logs.length) {
      return false; // Re-render when logs array length changes
    }

    // Secondary check: renderedNumber changed AND affects what's shown
    // Only re-render if renderedNumber actually changes the slice
    const prevRendered = prevProps.renderedNumber;
    const nextRendered = nextProps.renderedNumber;
    const logsLength = nextProps.logs.length;

    // If renderedNumber changed AND it affects the slice, re-render
    // This handles the case where new messages arrive and rendering limits shift
    if (prevRendered !== nextRendered) {
      // Only re-render if the change affects what's displayed
      // If both are >= logs length, no change in actual display
      const prevExceeds = prevRendered >= logsLength;
      const nextExceeds = nextRendered >= logsLength;
      if (prevExceeds !== nextExceeds) {
        return false; // One exceeds, other doesn't - re-render needed
      }
      if (!prevExceeds && !nextExceeds && prevRendered !== nextRendered) {
        return false; // Both don't exceed - re-render for slice change
      }
    }

    // For other props, use shallow comparison
    return (
      prevProps.logClass === nextProps.logClass &&
      prevProps.visible === nextProps.visible &&
      prevProps.fixedSize === nextProps.fixedSize &&
      prevProps.rule === nextProps.rule &&
      prevProps.icons === nextProps.icons &&
      prevProps.resolveLogById === nextProps.resolveLogById &&
      prevProps.onShortIdClick === nextProps.onShortIdClick &&
      prevProps.logPickup === nextProps.logPickup &&
      prevProps.t === nextProps.t
    );
  },
);

LogChunkContent.displayName = 'LogChunkContent';

/**
 * LogChunk component with React.memo using version number for comparison.
 * This avoids unnecessary re-renders when the chunk hasn't changed.
 */
const LogChunk = React.memo<ILogChunkProps>(
  props => {
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
      logPickup,
    } = props;

    // Early return if not visible and not fixed size
    if (!visible && !fixedSize) {
      return null;
    }

    const content = (
      <I18n namespace="game_client">
        {t => (
          <LogChunkContent
            t={t}
            logClass={logClass}
            logs={logs}
            visible={visible}
            fixedSize={fixedSize}
            renderedNumber={renderedNumber}
            rule={rule}
            icons={icons}
            resolveLogById={resolveLogById}
            onShortIdClick={onShortIdClick}
            logPickup={logPickup}
          />
        )}
      </I18n>
    );

    if (fixedSize) {
      return (
        <FixedSizeChunkWrapper className={visible ? '' : 'hidden'}>
          {content}
        </FixedSizeChunkWrapper>
      );
    } else {
      return content;
    }
  },
  (prevProps, nextProps) => {
    // Primary check: version changed (log added to this chunk)
    if (prevProps.version !== nextProps.version) {
      return false; // Re-render when version changes
    }

    // Secondary check: renderedNumber changed AND affects what's shown
    // This is needed because renderedNumber changes for all chunks when new message arrives
    const prevRendered = prevProps.renderedNumber;
    const nextRendered = nextProps.renderedNumber;
    const logsLength = nextProps.logs.length;

    // If renderedNumber changed AND it affects the slice, re-render
    if (prevRendered !== nextRendered) {
      // Only re-render if the change affects what's displayed
      const prevExceeds = prevRendered >= logsLength;
      const nextExceeds = nextRendered >= logsLength;
      if (prevExceeds !== nextExceeds) {
        return false; // One exceeds, other doesn't - re-render needed
      }
      if (!prevExceeds && !nextExceeds && prevRendered !== nextRendered) {
        return false; // Both don't exceed - re-render for slice change
      }
    }

    // For other props, use shallow comparison
    return (
      prevProps.logClass === nextProps.logClass &&
      prevProps.visible === nextProps.visible &&
      prevProps.fixedSize === nextProps.fixedSize &&
      prevProps.rule === nextProps.rule &&
      prevProps.icons === nextProps.icons &&
      prevProps.resolveLogById === nextProps.resolveLogById &&
      prevProps.onShortIdClick === nextProps.onShortIdClick &&
      prevProps.logPickup === nextProps.logPickup
    );
  },
);

LogChunk.displayName = 'LogChunk';
