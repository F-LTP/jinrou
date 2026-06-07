import styled from '../../util/styled';
import { AppStyling } from '../../styles/phone';

/**
 * Wrapper of whole page.
 */
export const Wrapper = styled(AppStyling)`
  padding: 0 20px 20px;
`;

/**
 * Wrapper of village rule template controls.
 */
export const TemplateControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4em;
  margin-top: 0.4em;
`;
