import { LogSupplement } from '../defs';
import {
  memo,
  Fragment,
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import autolink, { compile } from 'my-autolink';
import React from 'react';

export interface IPropCommentContent {
  comment: string;
  supplement?: LogSupplement[];
  resolveLogById?: (shortId: string) => string | null;
}

const GAP = 12;
const MAX_WIDTH = 360;

/**
 * 全局 tooltip 状态管理
 * 确保同一时间只有一个 tooltip 显示
 */
let currentTooltipClose: (() => void) | null = null;

/**
 * Tooltip component for log reference.
 */
export const LogReferenceTooltip = React.memo<{
  shortId: string;
  msg: string | null;
  playerName?: string;
}>(({ shortId, msg, playerName }) => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  /** 关闭当前 tooltip 的函数 */
  const closeThisTooltip = () => setVisible(false);

  /** 用真实高度修正 Y */
  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current) return;

    const el = tooltipRef.current;
    const rect = el.getBoundingClientRect();

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 12;
    const safe = 8; // 安全边距

    let top = 0;
    let left = 0;

    // =========================
    // ① 先决定上下
    // =========================
    const spaceAbove = pos.y;
    const spaceBelow = vh - pos.y;

    if (spaceAbove >= rect.height + gap) {
      // 优先上
      top = pos.y - rect.height - gap;
    } else if (spaceBelow >= rect.height + gap) {
      // 不够就下
      top = pos.y + gap;
    } else {
      // 两边都不够 → 选空间大的那边
      top = spaceAbove > spaceBelow ? safe : vh - rect.height - safe;
    }

    // =========================
    // ② 决定左右展开方向
    // =========================
    const spaceLeft = pos.x;
    const spaceRight = vw - pos.x;

    if (spaceRight >= rect.width / 2 && spaceLeft >= rect.width / 2) {
      // 居中
      left = pos.x - rect.width / 2;
    } else if (spaceRight >= rect.width) {
      // 向右展开
      left = pos.x + gap;
    } else if (spaceLeft >= rect.width) {
      // 向左展开
      left = pos.x - rect.width - gap;
    } else {
      // 哪边空间大靠哪边
      left = spaceRight > spaceLeft ? safe : vw - rect.width - safe;
    }

    // =========================
    // ③ 最终兜底防出屏
    // =========================
    left = Math.min(Math.max(left, safe), vw - rect.width - safe);
    top = Math.min(Math.max(top, safe), vh - rect.height - safe);

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [visible, pos.x, pos.y]);

  /** 全局点击关闭tooltip */
  useEffect(() => {
    if (!visible) return;

    const handleClick = (e: Event) => {
      // 检查点击目标是否是 tooltip 或其内部元素
      if (tooltipRef.current && tooltipRef.current.contains(e.target as Node)) {
        return;
      }
      // 检查点击目标是否是触发元素（>>xxx）或其内部
      const target = e.target as HTMLElement;
      if (target && target.closest('[data-tooltip-trigger]')) {
        return;
      }
      setVisible(false);
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [visible]);

  /** 管理 tooltip 互斥显示 */
  useEffect(() => {
    if (!visible) {
      // 当隐藏时，如果这是当前注册的 tooltip，清除注册
      if (currentTooltipClose && currentTooltipClose === closeThisTooltip) {
        currentTooltipClose = null;
      }
      return;
    }

    // 显示时，先关闭其他 tooltip，然后注册自己
    if (currentTooltipClose && currentTooltipClose !== closeThisTooltip) {
      currentTooltipClose();
    }
    currentTooltipClose = closeThisTooltip;

    return () => {
      // 清理时移除注册
      if (currentTooltipClose === closeThisTooltip) {
        currentTooltipClose = null;
      }
    };
  }, [visible]);

  /** 点击切换显示 */
  const onClick = (e: React.MouseEvent | React.TouchEvent) => {
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      const t = e.touches[0];
      if (!t) return;
      clientX = t.clientX;
      clientY = t.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    setPos({ x: clientX, y: clientY });
    setVisible(v => !v);
  };

  return (
    <>
      <b
        data-tooltip-trigger="true"
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      >
        {playerName ? (
          `>>${playerName}:${shortId}`
        ) : (
          <>
            {'>>'}
            {shortId}
          </>
        )}
      </b>

      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: 'fixed',
              left: pos.x,
              top: pos.y,
              transform: 'none',
              backgroundColor: 'rgba(0,0,0,0.95)',
              color: '#fff',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              lineHeight: 1.4,
              maxWidth: `${MAX_WIDTH}px`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              zIndex: 9999999,
              boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ fontSize: '13px' }}>{msg || '未找到对应发言'}</div>
          </div>,
          document.body,
        )}
    </>
  );
});

const autolinkSetting = compile(
  [
    'url',
    {
      pattern() {
        return /#(\d+)/g;
      },
      transform(_1, _2, num) {
        return {
          href: `/room/${num}`,
        };
      },
    },
  ],
  {
    url: {
      attributes: {
        rel: 'external',
      },
      text: url => {
        // Convert any room URL to room number syntax.
        const orig = location.origin;
        if (url.slice(0, orig.length) === orig) {
          const r = url.slice(orig.length).match(/^\/room\/(\d+)$/);
          if (r != null) {
            return `#${r[1]}`;
          }
        }
        return url;
      },
    },
  },
);

export const CommentContent: React.FunctionComponent<IPropCommentContent> = memo(
  ({ comment, supplement, resolveLogById }) => {
    // 检查是否包含特殊命令（骰子或引用）
    const hasSpecialCommand = /!(\d+)[dD](\d+)|>>\s*\d+/.test(comment);

    if (!hasSpecialCommand) {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: autolink(comment, autolinkSetting),
          }}
        />
      );
    }

    // perform calculation of special commands.
    const commandr = /!(\d+)[dD](\d+)|>>\s*(\d+)/g;
    const nodes: React.ReactNode[] = [];
    let currentIndex = 0;
    let supplementIndex = 0;
    let res;
    while ((res = commandr.exec(comment))) {
      // 1. 把普通文本补进去
      if (res.index > currentIndex) {
        nodes.push(comment.slice(currentIndex, res.index));
      }
      currentIndex = commandr.lastIndex;

      // ======================
      // 2. 处理骰子 !XdY
      // ======================
      if (res[1] != null) {
        if (!supplement) {
          nodes.push(res[0]);
          continue;
        }
        const sup = supplement[supplementIndex++];

        if (sup == null || sup.type !== 'dice') {
          nodes.push(res[0]);
          continue;
        }

        const { result } = sup;
        if (!result || result.length === 0) {
          nodes.push(res[0]);
          continue;
        }

        // dice result
        if (result.length === 1) {
          nodes.push(
            <b key={`dice-${res.index}`}>
              【{res[1]}D{res[2]}={result[0]}】
            </b>,
          );
        } else {
          const sum = result.reduce((a, b) => a + b, 0);
          nodes.push(
            <b key={`dice-${res.index}`}>
              【{res[1]}D{res[2]}={sum}({result.join('+')})】
            </b>,
          );
        }
        continue;
      }

      // ======================
      // 3. 处理 >>y 引用
      // ======================
      if (res[3] != null) {
        const shortId = res[3]; // 不再需要补齐，直接使用原始数字
        let msg = null;
        let playerName = undefined;

        if (resolveLogById) {
          const original = resolveLogById(shortId);
          if (original != null) {
            const logobj = JSON.parse(original);
            if (logobj != null) {
              playerName = logobj.name;
              msg =
                logobj.name != null && logobj.comment != null
                  ? `${logobj.name}：\n${logobj.comment}`
                  : logobj.comment != null
                  ? logobj.comment
                  : null;
            }
          }
        }

        nodes.push(
          <LogReferenceTooltip
            key={`ref-${res.index}`}
            shortId={shortId}
            msg={msg}
            playerName={playerName}
          />,
        );
        continue;
      }
    }

    if (currentIndex < comment.length) {
      nodes.push(comment.slice(currentIndex));
    }

    return (
      <>
        {nodes.map((node, i) =>
          typeof node === 'string' ? (
            <Fragment key={i}>
              <span
                dangerouslySetInnerHTML={{
                  __html: autolink(node, autolinkSetting),
                }}
              />
            </Fragment>
          ) : (
            <Fragment key={i}>{node}</Fragment>
          ),
        )}
      </>
    );
  },
);
