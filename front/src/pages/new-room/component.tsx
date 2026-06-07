import * as React from 'react';
import { i18n, I18nProvider } from '../../i18n';
import { TemplateControls, Wrapper } from './elements';
import {
  Controls,
  ControlsWrapper,
  ControlsName,
  ControlsDescription,
  ControlsHeader,
  ControlsMain,
  InlineControl,
} from '../../common/forms/controls-wrapper';
import { Input, Textarea } from '../../common/forms/text';
import { RadioButtons } from '../../common/forms/radio';
import { useI18n } from '../../i18n/react';
import { NewRoomStore } from './store';
import { observer } from 'mobx-react-lite';
import { FontAwesomeIcon } from '../../util/icon';
import { NormalButton, WideButton } from '../../common/button';
import { CheckButton } from '../../common/forms/check-button';
import { Select } from '../../common/forms/select';
import { showConfirmDialog } from '../../dialog';

export interface ThemeDoc {
  /**
   * displayed name of theme.
   */
  name: string;
  /**
   * ID of theme.
   */
  value: string;
}

export interface IPropNewRoom {
  themes: ThemeDoc[];
  store: NewRoomStore;
  roomDefaults?: {
    villageRules?: string;
  };
  onCreate(query: unknown): void;
}

interface VillageRuleTemplate {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
}

const villageRuleTemplatesStorageKey = 'jinrou-village-rule-templates';

function loadVillageRuleTemplates(): VillageRuleTemplate[] {
  try {
    const raw = localStorage.getItem(villageRuleTemplatesStorageKey);
    if (raw == null) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (template): template is VillageRuleTemplate =>
        typeof template?.id === 'string' &&
        typeof template?.name === 'string' &&
        typeof template?.content === 'string' &&
        typeof template?.updatedAt === 'string',
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

function saveVillageRuleTemplates(templates: VillageRuleTemplate[]): void {
  localStorage.setItem(
    villageRuleTemplatesStorageKey,
    JSON.stringify(templates),
  );
}

export const NewRoom: React.FunctionComponent<IPropNewRoom> = observer(
  ({ themes, store, roomDefaults, onCreate }) => {
    const t = useI18n('newroom_client');
    const nameInputRef = React.useRef<HTMLInputElement | null>(null);
    const passwordInputRef = React.useRef<HTMLInputElement | null>(null);
    const commentInputRef = React.useRef<HTMLInputElement | null>(null);
    const villageRulesInputRef = React.useRef<HTMLTextAreaElement | null>(null);
    const maxNumberInputRef = React.useRef<HTMLInputElement | null>(null);
    const themeSelectRef = React.useRef<HTMLSelectElement | null>(null);
    const templateSelectRef = React.useRef<HTMLSelectElement | null>(null);
    const [villageRuleTemplates, setVillageRuleTemplates] = React.useState<
      VillageRuleTemplate[]
    >(() => loadVillageRuleTemplates());
    // memory of whether submit button was explicitly clicked (or pressed).
    const enterPressedRef = React.useRef(false);

    React.useEffect(() => {
      // initialize store with saved jobs.
      if (localStorage.savedRule) {
        try {
          const savedRule = JSON.parse(localStorage.savedRule);
          if ('number' === typeof savedRule.maxnumber) {
            if (maxNumberInputRef.current != null) {
              maxNumberInputRef.current.value = String(savedRule.maxnumber);
            }
          }
          if ('string' === typeof savedRule.blind) {
            store.setBlind(savedRule.blind);
          }
          if ('boolean' === typeof savedRule.gm) {
            store.setGm(savedRule.gm);
          }
          if ('boolean' === typeof savedRule.watchspeak) {
            store.setWatchSpeak(savedRule.watchspeak);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }, []);
    const applyVillageRuleTemplate = React.useCallback(
      (selectedId: string) => {
        const template = villageRuleTemplates.find(t => t.id === selectedId);
        if (template != null && villageRulesInputRef.current != null) {
          villageRulesInputRef.current.value = template.content;
        }
      },
      [villageRuleTemplates],
    );
    const saveVillageRuleTemplate = React.useCallback(() => {
      const name = window.prompt(t('villageRules.templateNamePrompt'));
      const normalizedName = name?.trim();
      if (!normalizedName) {
        return;
      }
      const content = villageRulesInputRef.current?.value || '';
      const now = new Date().toISOString();
      setVillageRuleTemplates(current => {
        const oldTemplate = current.find(t => t.name === normalizedName);
        const nextTemplate = {
          id:
            oldTemplate?.id ||
            `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`,
          name: normalizedName,
          content,
          updatedAt: now,
        };
        const next = [
          nextTemplate,
          ...current.filter(t => t.name !== normalizedName),
        ];
        saveVillageRuleTemplates(next);
        return next;
      });
    }, [t]);
    const deleteVillageRuleTemplate = React.useCallback(() => {
      const selectedId = templateSelectRef.current?.value;
      if (!selectedId) {
        return;
      }
      setVillageRuleTemplates(current => {
        const next = current.filter(t => t.id !== selectedId);
        saveVillageRuleTemplates(next);
        return next;
      });
      if (templateSelectRef.current != null) {
        templateSelectRef.current.value = '';
      }
    }, []);
    const passwordOptions = React.useMemo(
      () => [
        {
          value: 'no',
          label: t('password.no'),
        },
        {
          value: 'yes',
          label: t('password.yes'),
        },
      ],
      [t],
    );
    const blindOptions = React.useMemo(
      () => [
        {
          value: '',
          label: t('blind.no'),
        },
        {
          value: 'yes',
          label: t('game_client:roominfo.blind'),
        },
        {
          value: 'complete',
          label: t('game_client:roominfo.blindComplete'),
        },
      ],
      [t],
    );
    const gmOptions = React.useMemo(
      () => [
        {
          value: 'no',
          label: t('gm.no'),
        },
        {
          value: 'yes',
          label: t('gm.yes'),
        },
      ],
      [t],
    );
    const watchSpeakOptions = React.useMemo(
      () => [
        {
          value: 'no',
          label: t('watchSpeak.no'),
        },
        {
          value: 'yes',
          label: t('watchSpeak.yes'),
        },
      ],
      [t],
    );
    const keydownHandler = (e: React.KeyboardEvent<HTMLFormElement>) => {
      const target = e.target as HTMLInputElement;
      if (e.key !== 'Enter') {
        return;
      }
      if (target.tagName === 'INPUT' && target.type === 'submit') {
        // allow because user explicitly pressed the submit button.
        enterPressedRef.current = false;
      } else {
        enterPressedRef.current = true;
      }
    };
    const submitHandler = (e: React.SyntheticEvent<HTMLFormElement>) => {
      e.preventDefault();
      const confirmed = !enterPressedRef.current
        ? Promise.resolve(true)
        : showConfirmDialog({
            title: t('title'),
            message: t('confirm.message'),
            yes: t('confirm.yes'),
            no: t('confirm.no'),
          });
      enterPressedRef.current = false;

      confirmed.then(c => {
        if (!c) {
          // canceled by used
          return;
        }

        const getValue = (ref: { current: { value: string } | null }) => {
          return ref.current != null ? ref.current.value : '';
        };
        const query = {
          name: getValue(nameInputRef),
          usepassword: store.usePassword ? 'on' : '',
          password: store.usePassword ? getValue(passwordInputRef) : void 0,
          comment: getValue(commentInputRef),
          villageRules: getValue(villageRulesInputRef),
          number: getValue(maxNumberInputRef),
          blind: store.blind,
          theme: getValue(themeSelectRef),
          ownerGM: store.gm ? 'yes' : '',
          watchspeak: store.watchSpeak ? 'on' : 'off',
        };
        onCreate(query);
      });
    };
    return (
      <Wrapper>
        <h1>
          {t('title')}
          {'　'}
          <InlineControl>
            <CheckButton
              slim
              checked={store.descriptionShown}
              onChange={value => store.setDescriptionShown(value)}
            >
              {t('showDescriptionButton')}
            </CheckButton>
          </InlineControl>
        </h1>
        <form onSubmit={submitHandler} onKeyDown={keydownHandler}>
          <ControlsWrapper>
            {/* title input */}
            <ControlsHeader>
              <ControlsName>{t('roomname.title')}</ControlsName>
            </ControlsHeader>
            <ControlsMain>
              <Input type="text" required name="room-name" ref={nameInputRef} />
            </ControlsMain>
            {/* password settings */}
            <ControlsHeader>
              <ControlsName>{t('password.title')}</ControlsName>
              {store.descriptionShown ? (
                <ControlsDescription>
                  {t('password.description')}
                </ControlsDescription>
              ) : null}
            </ControlsHeader>
            <ControlsMain>
              <RadioButtons
                onChange={value => store.setUsePassword(value === 'yes')}
                current={store.usePassword ? 'yes' : 'no'}
                options={passwordOptions}
              />
              {!store.usePassword ? null : (
                <>
                  <FontAwesomeIcon icon="lock" />{' '}
                  <Input
                    type="text"
                    required
                    size={30}
                    placeholder={t('password.placeholder')}
                    ref={passwordInputRef}
                  />
                </>
              )}
            </ControlsMain>
            {/* comment input */}
            <ControlsHeader>
              <ControlsName>{t('comment.title')}</ControlsName>
              {store.descriptionShown ? (
                <ControlsDescription>
                  {t('comment.description')}
                </ControlsDescription>
              ) : null}
            </ControlsHeader>
            <ControlsMain>
              <Input type="text" name="room-comment" ref={commentInputRef} />
            </ControlsMain>
            {/* village rules input */}
            <ControlsHeader>
              <ControlsName>{t('villageRules.title')}</ControlsName>
              {store.descriptionShown ? (
                <ControlsDescription>
                  {t('villageRules.description')}
                </ControlsDescription>
              ) : null}
            </ControlsHeader>
            <ControlsMain>
              <Textarea
                name="village-rules"
                rows={6}
                defaultValue={roomDefaults?.villageRules || ''}
                ref={villageRulesInputRef}
              />
              <TemplateControls>
                <Select
                  ref={templateSelectRef}
                  onChange={e => applyVillageRuleTemplate(e.target.value)}
                >
                  <option value="">{t('villageRules.template.none')}</option>
                  {villageRuleTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </Select>
                <NormalButton type="button" onClick={saveVillageRuleTemplate}>
                  {t('villageRules.template.save')}
                </NormalButton>
                <NormalButton type="button" onClick={deleteVillageRuleTemplate}>
                  {t('villageRules.template.delete')}
                </NormalButton>
              </TemplateControls>
            </ControlsMain>
          </ControlsWrapper>
          {/* max number of room. */}
          <Controls
            title={t('maxnumber.title')}
            description={
              store.descriptionShown ? t('maxnumber.description') : void 0
            }
            compact={!store.descriptionShown}
          >
            <Input
              type="number"
              size={10}
              defaultValue="30"
              min="5"
              ref={maxNumberInputRef}
            />
          </Controls>
          {/* blind mode */}
          <Controls
            title={t('blind.title')}
            description={
              store.descriptionShown ? t('blind.description') : void 0
            }
            compact={!store.descriptionShown}
          >
            <RadioButtons
              onChange={value => store.setBlind(value as any)}
              current={store.blind}
              options={blindOptions}
            />
          </Controls>
          {/* theme */}
          {themes.length > 0 ? (
            <Controls
              title={t('theme.title')}
              description={
                store.descriptionShown ? t('theme.description') : void 0
              }
              compact={!store.descriptionShown}
            >
              <Select ref={themeSelectRef}>
                <option value="">{t('theme.none')}</option>
                {themes.map(theme => (
                  <option key={theme.value} value={theme.value}>
                    {theme.name}
                  </option>
                ))}
              </Select>
            </Controls>
          ) : null}
          {/* gm */}
          <Controls
            title={t('gm.title')}
            description={store.descriptionShown ? t('gm.description') : void 0}
            compact={!store.descriptionShown}
          >
            <RadioButtons
              onChange={value => store.setGm(value === 'yes')}
              current={store.gm ? 'yes' : 'no'}
              options={gmOptions}
            />
          </Controls>
          {/* watchSpeak */}
          <Controls
            title={t('watchSpeak.title')}
            description={
              store.descriptionShown ? t('watchSpeak.description') : void 0
            }
            compact={!store.descriptionShown}
          >
            <RadioButtons
              onChange={value => store.setWatchSpeak(value === 'yes')}
              current={store.watchSpeak ? 'yes' : 'no'}
              options={watchSpeakOptions}
            />
          </Controls>
          <WideButton type="submit" disabled={store.formDisabled}>
            {t('create')}
          </WideButton>
        </form>
      </Wrapper>
    );
  },
);
