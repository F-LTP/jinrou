import styled, { css } from '../../../util/styled';
import { phone } from '../../../common/media';

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
}>`
  width: 100%;
  contain: layout style;
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

  /* Original filter implementation using data-userid attribute */
  ${({ logClass, logPickup }) =>
    logPickup != null
      ? css`
          .${logClass}:not([data-userid="${logPickup}"]) {
            opacity: 0.3;
          }
        `
      : ''}
`;

/**
 * Wrapper of chunk, used in fixed-size mode.
 */
export const FixedSizeChunkWrapper = styled.div<{
  visible: boolean;
}>`
  contain: layout style;
  display: ${({ visible }) => (visible ? 'block' : 'none')};
`;

/**
 * Wrapper of one log line in non-fixedSize mode.
 * Uses grid to match parent LogWrapper's layout.
 */
export const LogLineWrapper = styled.div`
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
`;

/**
 * Wrapper of one log line, used in fixed-size layout.
 */
export const FixedSizeLogRow = styled.div`
  display: grid;
  grid-template-columns: ${fixedSizeGridColumnsPC};
  contain: layout style;
  margin-bottom: -0.35px;
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
