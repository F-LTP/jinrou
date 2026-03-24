import styled, { css } from '../../../util/styled';
import { phone } from '../../../common/media';

/**
 * CSS for filtered logs (reduced opacity)
 * Applied to elements with data-filtered attribute
 */
const filteredStyle = css`
  opacity: 0.3;
`;

/**
 * Columns definition of fixed-size log layout.
 */
const fixedSizeGridColumnsPC = '16px 10em 1fr auto';
const fixedSizeGridColumnsPhone = '16px 1fr auto';
/**
 * Wrapper of whole logs.
 */
export const LogWrapper = styled.div<{
  /**
   * The class attached to each log.
   */
  logClass: string;
  /**
   * ID of user currently picked up.
   */
  logPickup: string | null;
  /**
   * Whether the UI is in "fixed-size mode".
   */
  fixedSize: boolean;
  /**
   * Callback for click to reset log pickup filter (double-click detection).
   */
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Whether there is an active filter (used for CSS styling).
   */
  'data-has-filter'?: string;
}>`
  width: 100%;
  display: ${props => (props.fixedSize ? 'block' : 'grid')};
  grid-template-columns:
    minmax(8px, max-content)
    fit-content(10em)
    1fr
    auto;
  ${phone`
    grid-template-columns:
      minmax(8px, max-content)
      1fr
      auto;
    grid-auto-flow: row dense;
  `};

  /* Apply opacity to filtered logs (non-fixedSize mode) */
  &[data-has-filter='true'] [data-filtered='true'] {
    opacity: 0.3;
  }
`;

/**
 * Wrapper of chunk, used in fixed-size mode.
 */
export const FixedSizeChunkWrapper = styled.div<{
  visible: boolean;
}>`
  display: ${({ visible }) => (visible ? 'block' : 'none')};
`;

/**
 * Wrapper of one log line in non-fixedSize mode.
 * Uses grid to match parent LogWrapper's layout.
 */
export const LogLineWrapper = styled.div<{ className?: string }>`
  display: grid;
  grid-template-columns:
    minmax(8px, max-content)
    fit-content(10em)
    1fr
    auto;
  grid-column: 1 / -1;
  ${phone`
    grid-template-columns:
      minmax(8px, max-content)
      1fr
      auto;
    grid-auto-flow: row dense;
  `};
  /* Apply opacity when filtered class is present */
  &.jf-log-filtered > * {
    opacity: 0.3 !important;
  }
`;

/**
 * Wrapper of one log line, used in fixed-size layout.
 */
export const FixedSizeLogRow = styled.div<{ className?: string }>`
  display: grid;
  grid-template-columns: ${fixedSizeGridColumnsPC};
  margin-bottom: -0.35px;
  /* Apply opacity when filtered class is present */
  &.jf-log-filtered > * {
    opacity: 0.3 !important;
  }
  ${phone`
    grid-template-columns: ${fixedSizeGridColumnsPhone};
    grid-auto-flow: row dense;
  `};
`;

/**
 * Wrapper of log rendering pending indicator.
 */
export const PendingLogMessage = styled.div`
  grid-column: 1 / -1;
  padding: 0.7em 1em;
  background-color: #929292;
  color: #f4f4f4;
  font-size: calc(0.8 * var(--base-font-size));
  text-align: center;
`;
