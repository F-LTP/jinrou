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
   * Callback for resetting log pickup filter.
   */
  onResetLogPickup(): void;
  /**
   * Callback for shortId click.
   */
  onShortIdClick?: (shortId: string) => void;
}

export interface IStateLogs {
  renderingState: LogsRenderingState;
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
    };
  }
  public componentDidUpdate(prevProps: IPropLogs) {
    if (!prevProps.logs.loaded && this.props.logs.loaded) {
      this.state.renderingState.reset(this.props.logs.allLogNumber);
    }
  }
  public componentWillUnmount() {
    this.state.renderingState.dispose();
  }

  /**
   * Resolve log by shortId for reply reference.
   * This is a performance-optimized lookup using the shortId index.
   * Returns the StoredLog object directly to avoid JSON serialization overhead.
   */
  private resolveLogById = (shortId: string): StoredLog | null => {
    return this.props.logs.findByShortId(shortId);
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
        onClick={onResetLogPickup}
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
            />
          );
        })}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    // Check if logs length changed (new log added)
    const logsChanged = prevProps.logs.length !== nextProps.logs.length;
    if (logsChanged) {
      return false; // Re-render when logs array length changes
    }
    // For other props, use shallow comparison
    return (
      prevProps.logClass === nextProps.logClass &&
      prevProps.visible === nextProps.visible &&
      prevProps.fixedSize === nextProps.fixedSize &&
      prevProps.renderedNumber === nextProps.renderedNumber &&
      prevProps.rule === nextProps.rule &&
      prevProps.icons === nextProps.icons &&
      prevProps.resolveLogById === nextProps.resolveLogById &&
      prevProps.onShortIdClick === nextProps.onShortIdClick &&
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
          />
        )}
      </I18n>
    );

    if (fixedSize) {
      return (
        <FixedSizeChunkWrapper visible={visible}>
          {content}
        </FixedSizeChunkWrapper>
      );
    } else {
      return content;
    }
  },
  (prevProps, nextProps) => {
    // Custom comparison using version number
    // If version changed, re-render (return false)
    // If version same AND other props same, skip re-render (return true)
    return (
      prevProps.version === nextProps.version &&
      prevProps.logClass === nextProps.logClass &&
      prevProps.visible === nextProps.visible &&
      prevProps.fixedSize === nextProps.fixedSize &&
      prevProps.renderedNumber === nextProps.renderedNumber &&
      prevProps.rule === nextProps.rule &&
      prevProps.icons === nextProps.icons &&
      prevProps.resolveLogById === nextProps.resolveLogById &&
      prevProps.onShortIdClick === nextProps.onShortIdClick
    );
  },
);

LogChunk.displayName = 'LogChunk';
