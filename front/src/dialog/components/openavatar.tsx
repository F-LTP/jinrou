import * as React from 'react';
import { IOpenAvatarDialog, OpenAvatarResult } from '../defs';
import { Dialog } from './base';
import { NoButton, YesButton } from './parts';
import bind from 'bind-decorator';

export interface IPropOpenAvatarDialog extends IOpenAvatarDialog {
  onSelect(result: OpenAvatarResult): void;
}

interface Role {
  theme: string;
  themeName: string;
  skinKey: string;
  name: string;
  avatar: string | string[];
  prize: string | string[];
}

interface ThemeGroup {
  themeName: string;
  theme: string;
  roles: Role[];
}

type TabType = 'role' | 'custom';

export class OpenAvatarDialog extends React.PureComponent<
  IPropOpenAvatarDialog,
  {
    loading: boolean;
    themeGroups: ThemeGroup[] | null;
    selectedThemeName: string;
    selectedSkinKey: string;
    activeTab: TabType;
    customName: string;
    customIcon: string;
    themeFilter: string;
  }
> {
  constructor(props: IPropOpenAvatarDialog) {
    super(props);
    this.state = {
      loading: true,
      themeGroups: null,
      selectedThemeName: '',
      selectedSkinKey: '',
      activeTab: 'role',
      customName: '',
      customIcon: '',
      themeFilter: '',
    };
  }

  public componentDidMount(): void {
    this.props.roles
      .then(roles => {
        const themeMap = new Map<string, ThemeGroup>();
        roles.forEach(role => {
          if (!themeMap.has(role.themeName)) {
            themeMap.set(role.themeName, {
              themeName: role.themeName,
              theme: role.theme,
              roles: [],
            });
          }
          themeMap.get(role.themeName)!.roles.push(role);
        });
        this.setState({
          loading: false,
          themeGroups: Array.from(themeMap.values()),
        });
      })
      .catch(err => {
        console.error(err);
        this.setState({ loading: false, themeGroups: [] });
      });
  }

  public render() {
    const {
      modal,
      title,
      message,
      randomAll,
      randomTheme,
      select,
      cancel,
    } = this.props;
    const {
      loading,
      themeGroups,
      selectedThemeName,
      selectedSkinKey,
      activeTab,
      customName,
      customIcon,
      themeFilter,
    } = this.state;

    const selectedTheme = themeGroups
      ? themeGroups.find(t => t.themeName === selectedThemeName) || null
      : null;
    const selectedRole = selectedTheme
      ? selectedTheme.roles.find(r => r.skinKey === selectedSkinKey) || null
      : null;
    const isTaken = selectedRole
      ? this.props.selectedNames.includes(selectedRole.name)
      : false;

    // Check if can confirm selection
    const canConfirm =
      activeTab === 'role'
        ? selectedRole && !isTaken
        : customName.trim().length > 0; // customIcon 可以为空

    return (
      <Dialog
        modal={modal}
        title={title}
        message={message}
        onCancel={this.handleCancel}
        buttons={() => (
          <>
            <NoButton onClick={this.handleCancel}>{cancel}</NoButton>
            {activeTab === 'role' && (
              <>
                <YesButton onClick={this.handleRandomAllClick}>
                  {randomAll}
                </YesButton>
                <YesButton
                  onClick={this.handleRandomThemeClick}
                  disabled={!selectedTheme}
                >
                  {randomTheme}
                </YesButton>
              </>
            )}
            <YesButton onClick={this.handleSelectClick} disabled={!canConfirm}>
              {select}
            </YesButton>
          </>
        )}
        contents={() => (
          <div style={styles.container}>
            {loading ? (
              <div style={styles.loading}>加载中...</div>
            ) : (
              <>
                {/* Tabs */}
                <div style={styles.tabs}>
                  <div
                    style={{
                      ...styles.tab,
                      ...(activeTab === 'role' ? styles.tabActive : {}),
                    }}
                    onClick={this.handleTabRole}
                  >
                    角色选择
                  </div>
                  <div
                    style={{
                      ...styles.tab,
                      ...(activeTab === 'custom' ? styles.tabActive : {}),
                    }}
                    onClick={this.handleTabCustom}
                  >
                    自定义
                  </div>
                </div>

                {/* Role Selection Tab */}
                {activeTab === 'role' && (
                  <>
                    <div style={styles.selectGroup}>
                      <label style={styles.label}>搜索主题</label>
                      <input
                        type="text"
                        value={themeFilter}
                        onChange={this.handleThemeFilterChange}
                        placeholder="输入主题名称筛选..."
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.selectGroup}>
                      <label style={styles.label}>选择主题</label>
                      <div style={styles.themeSelectContainer}>
                        <div style={styles.themeList}>
                          {themeGroups!
                            .filter(
                              group =>
                                themeFilter.trim() === '' ||
                                group.themeName
                                  .toLowerCase()
                                  .includes(themeFilter.toLowerCase()),
                            )
                            .map(group => (
                              <div
                                key={group.themeName}
                                style={{
                                  ...styles.themeOption,
                                  ...(selectedThemeName === group.themeName
                                    ? styles.themeOptionSelected
                                    : {}),
                                }}
                                onClick={() =>
                                  this.handleThemeSelect(group.themeName)
                                }
                                onMouseEnter={e => {
                                  if (selectedThemeName !== group.themeName) {
                                    (e.currentTarget as HTMLElement).style.backgroundColor =
                                      '#f5f5f5';
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (selectedThemeName !== group.themeName) {
                                    (e.currentTarget as HTMLElement).style.backgroundColor =
                                      'transparent';
                                  }
                                }}
                              >
                                <div style={styles.themeOptionName}>
                                  {group.themeName}
                                </div>
                                <div style={styles.themeOptionCount}>
                                  {group.roles.length}个角色
                                </div>
                              </div>
                            ))}
                          {themeGroups!.filter(
                            group =>
                              themeFilter.trim() === '' ||
                              group.themeName
                                .toLowerCase()
                                .includes(themeFilter.toLowerCase()),
                          ).length === 0 && (
                            <div style={styles.noResult}>未找到匹配的主题</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedTheme && (
                      <div style={styles.selectGroup}>
                        <label style={styles.label}>选择角色</label>
                        <select
                          value={selectedSkinKey}
                          onChange={this.handleRoleChange}
                          style={styles.select}
                        >
                          <option value="">-- 请选择角色 --</option>
                          {selectedTheme.roles.map(role => {
                            const taken = this.props.selectedNames.includes(
                              role.name,
                            );
                            return (
                              <option
                                key={role.skinKey}
                                value={role.skinKey}
                                disabled={taken}
                              >
                                {taken ? `${role.name} (已选)` : role.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {selectedRole && (
                      <div style={styles.preview}>
                        <img
                          src={
                            Array.isArray(selectedRole.avatar)
                              ? selectedRole.avatar[0]
                              : selectedRole.avatar
                          }
                          alt={selectedRole.name}
                          style={styles.previewAvatar}
                        />
                        <div style={styles.previewInfo}>
                          <div style={styles.previewName}>
                            {selectedRole.name}
                          </div>
                          <div style={styles.previewTheme}>
                            {selectedRole.themeName}
                          </div>
                          {isTaken && (
                            <div style={styles.takenWarning}>
                              该角色已被选择
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Custom Tab */}
                {activeTab === 'custom' && (
                  <>
                    <div style={styles.selectGroup}>
                      <label style={styles.label}>自定义名字</label>
                      <input
                        type="text"
                        value={customName}
                        onChange={this.handleCustomNameChange}
                        placeholder="请输入你的名字"
                        style={styles.input}
                        maxLength={50}
                      />
                    </div>

                    <div style={styles.selectGroup}>
                      <label style={styles.label}>自定义头像URL</label>
                      <input
                        type="text"
                        value={customIcon}
                        onChange={this.handleCustomIconChange}
                        placeholder="请输入图片URL (如: https://example.com/avatar.png)"
                        style={styles.input}
                      />
                    </div>

                    {customIcon && (
                      <div style={styles.preview}>
                        <img
                          src={customIcon}
                          alt="预览"
                          style={styles.previewAvatar}
                          onError={e => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                        <div style={styles.previewInfo}>
                          <div style={styles.previewName}>
                            {customName || '未命名'}
                          </div>
                          <div style={styles.previewTheme}>自定义头像</div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      />
    );
  }

  @bind
  private handleTabRole(): void {
    this.setState({ activeTab: 'role' });
  }

  @bind
  private handleTabCustom(): void {
    this.setState({ activeTab: 'custom' });
  }

  @bind
  private handleThemeChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    this.setState({
      selectedThemeName: e.target.value,
      selectedSkinKey: '',
    });
  }

  @bind
  private handleThemeFilterChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    this.setState({ themeFilter: e.target.value });
  }

  @bind
  private handleThemeSelect(themeName: string): void {
    this.setState({
      selectedThemeName: themeName,
      selectedSkinKey: '',
    });
  }

  @bind
  private handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    this.setState({ selectedSkinKey: e.target.value });
  }

  @bind
  private handleCustomNameChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ customName: e.target.value });
  }

  @bind
  private handleCustomIconChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ customIcon: e.target.value });
  }

  @bind
  private handleCancel(): void {
    this.props.onSelect(null);
  }

  @bind
  private handleRandomAllClick(): void {
    const { themeGroups } = this.state;
    if (!themeGroups || themeGroups.length === 0) return;

    const availableRoles: Role[] = [];
    themeGroups.forEach(group => {
      group.roles.forEach(role => {
        if (!this.props.selectedNames.includes(role.name)) {
          availableRoles.push(role);
        }
      });
    });

    if (availableRoles.length === 0) return;

    const randomRole =
      availableRoles[Math.floor(Math.random() * availableRoles.length)];
    this.setState({
      selectedThemeName: randomRole.themeName,
      selectedSkinKey: randomRole.skinKey,
    });
  }

  @bind
  private handleRandomThemeClick(): void {
    const { selectedThemeName, themeGroups } = this.state;
    if (!selectedThemeName || !themeGroups) return;

    const selectedTheme = themeGroups.find(
      t => t.themeName === selectedThemeName,
    );
    if (!selectedTheme) return;

    const availableRoles = selectedTheme.roles.filter(
      role => !this.props.selectedNames.includes(role.name),
    );

    if (availableRoles.length === 0) return;

    const randomRole =
      availableRoles[Math.floor(Math.random() * availableRoles.length)];
    this.setState({ selectedSkinKey: randomRole.skinKey });
  }

  @bind
  private handleSelectClick(): void {
    const {
      activeTab,
      selectedSkinKey,
      selectedThemeName,
      themeGroups,
      customName,
      customIcon,
    } = this.state;

    if (activeTab === 'role') {
      // Role selection mode
      if (!selectedSkinKey) return;

      const theme = themeGroups
        ? themeGroups.find(t => t.themeName === selectedThemeName)
        : null;
      if (!theme) return;

      const role = theme.roles.find(r => r.skinKey === selectedSkinKey);
      if (!role || this.props.selectedNames.includes(role.name)) return;

      this.props.onSelect({
        type: 'role',
        theme: role.theme,
        skinKey: role.skinKey,
      });
    } else {
      // Custom mode - customIcon 可以为空
      if (!customName.trim()) return;

      this.props.onSelect({
        type: 'custom',
        customName: customName.trim(),
        customIcon: customIcon.trim(), // 允许为空字符串
      });
    }
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minWidth: '320px',
    padding: '10px 0',
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
  },
  tabs: {
    display: 'flex',
    marginBottom: '15px',
    borderBottom: '1px solid #ddd',
  },
  tab: {
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    color: '#666',
  },
  tabActive: {
    borderBottom: '2px solid #2196F3',
    color: '#2196F3',
    fontWeight: 'bold',
  },
  selectGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333',
  },
  select: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
  },
  themeSelectContainer: {
    border: '1px solid #ccc',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  themeList: {
    maxHeight: '200px',
    overflowY: 'auto' as const,
  },
  themeOption: {
    padding: '5px 6px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  },
  themeOptionSelected: {
    backgroundColor: '#e3f2fd',
    borderLeft: '3px solid #2196F3',
  },
  themeOptionName: {
    fontSize: '14px',
    color: '#333',
  },
  themeOptionCount: {
    fontSize: '12px',
    color: '#999',
  },
  noResult: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
  },
  preview: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  previewAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    marginRight: '12px',
    objectFit: 'cover' as const,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  previewTheme: {
    fontSize: '12px',
    color: '#666',
  },
  takenWarning: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#ff5252',
    fontWeight: 'bold',
  },
};
