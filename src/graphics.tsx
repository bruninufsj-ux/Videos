import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedText} from './motion';
import {C, FONT, MONO} from './style';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);

const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping}});
};

const useDraw = (delay: number, duration: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [delay, delay + duration], [0, 1], {...clamp, easing: ease});
};

// Fades a scene in and out inside its own Sequence, so cuts never snap.
const Scene: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const opacity = interpolate(frame, [0, 10, durationInFrames - 10, durationInFrames], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

const Title: React.FC<{children: React.ReactNode; delay?: number; top: number; size?: number}> = ({
  children,
  delay = 0,
  top,
  size = 60,
}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 800,
        color: C.ink,
        letterSpacing: -1,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Stroke: React.FC<{d: string; draw: number; width?: number}> = ({d, draw, width = 5}) => (
  <path
    d={d}
    pathLength={1}
    fill="none"
    stroke={C.accent}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeDasharray={1}
    strokeDashoffset={1 - draw}
  />
);

const Icon: React.FC<{kind: 'doc' | 'chart' | 'funnel'; draw: number}> = ({kind, draw}) => (
  <svg width={130} height={130} viewBox="0 0 120 120">
    {kind === 'doc' && (
      <>
        <Stroke d="M30 14 H72 L94 36 V106 H30 Z" draw={draw} />
        <Stroke d="M44 60 H80 M44 78 H80 M44 96 H68" draw={draw} width={4} />
      </>
    )}
    {kind === 'chart' && (
      <>
        <Stroke d="M16 104 H104" draw={draw} />
        <Stroke d="M32 104 V74 M58 104 V46 M84 104 V62" draw={draw} width={9} />
      </>
    )}
    {kind === 'funnel' && <Stroke d="M14 22 H106 L72 66 V102 L48 114 V66 Z" draw={draw} />}
  </svg>
);

const pillars: {label: string; kind: 'doc' | 'chart' | 'funnel'}[] = [
  {label: 'Entregáveis', kind: 'doc'},
  {label: 'Processos comerciais', kind: 'chart'},
  {label: 'Aquisição de clientes', kind: 'funnel'},
];

const PillarCard: React.FC<{label: string; kind: 'doc' | 'chart' | 'funnel'; delay: number}> = ({label, kind, delay}) => {
  const p = useEnter(delay);
  const draw = useDraw(delay + 8, 36);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 40,
        padding: '34px 46px',
        borderRadius: 32,
        background: C.panel,
        border: `2px solid ${C.accent}55`,
        opacity: p,
        transform: `translateX(${(1 - p) * -140}px)`,
      }}
    >
      <Icon kind={kind} draw={draw} />
      <div style={{fontFamily: FONT, fontSize: 48, fontWeight: 700, color: C.ink}}>{label}</div>
    </div>
  );
};

export const PillarsScene: React.FC = () => (
  <Scene>
    <Title top={470} size={64}>
      Processos da minha empresa
    </Title>
    <div style={{position: 'absolute', top: 640, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 44}}>
      {pillars.map((p, i) => (
        <PillarCard key={p.label} label={p.label} kind={p.kind} delay={12 + i * 14} />
      ))}
    </div>
  </Scene>
);

const Node: React.FC<{cx: number; cy: number; kind: 'spark' | 'gear' | 'play'; delay: number}> = ({cx, cy, kind, delay}) => {
  const p = useEnter(delay, 14);
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * p})`} opacity={p}>
      <circle r={104} fill={C.panel} stroke={C.accent} strokeWidth={4} />
      {kind === 'spark' && (
        <path d="M0 -44 L11 -11 L44 0 L11 11 L0 44 L-11 11 L-44 0 L-11 -11 Z" fill={C.accent} />
      )}
      {kind === 'gear' && (
        <>
          <circle r={30} fill="none" stroke={C.accent} strokeWidth={8} />
          <circle
            r={50}
            fill="none"
            stroke={C.accentSoft}
            strokeWidth={5}
            strokeDasharray="12 12"
            transform={`rotate(${frame * 3})`}
          />
        </>
      )}
      {kind === 'play' && <path d="M-18 -30 L34 0 L-18 30 Z" fill={C.accent} />}
    </g>
  );
};

const nodes: {label: string; kind: 'spark' | 'gear' | 'play'; x: number}[] = [
  {label: 'Ideia', kind: 'spark', x: 200},
  {label: 'Automatizar', kind: 'gear', x: 540},
  {label: 'Rodando', kind: 'play', x: 880},
];

const NodeLabel: React.FC<{x: number; y: number; delay: number; children: React.ReactNode}> = ({x, y, delay, children}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x - 160,
        width: 320,
        textAlign: 'center',
        fontFamily: FONT,
        fontSize: 42,
        fontWeight: 700,
        color: C.ink,
        opacity: p,
      }}
    >
      {children}
    </div>
  );
};

export const AutomationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const y = 900;
  return (
    <Scene>
      <Title top={500} size={60}>
        Uma ideia: automatizar
      </Title>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[0, 1].map((i) => {
          const from = nodes[i].x + 110;
          const to = nodes[i + 1].x - 110;
          const draw = interpolate(frame, [30 + i * 18, 52 + i * 18], [0, 1], {...clamp, easing: ease});
          const dot = interpolate(frame, [60 + i * 18, 110 + i * 18], [0, 1], clamp);
          return (
            <g key={i}>
              <line x1={from} y1={y} x2={to} y2={y} stroke={C.accent} strokeWidth={5} strokeDasharray={`${(to - from) * draw} 9999`} strokeLinecap="round" />
              {draw > 0.99 && (
                <circle cx={from + (to - from) * (dot % 1)} cy={y} r={9} fill={C.accentSoft} opacity={0.9} />
              )}
            </g>
          );
        })}
        {nodes.map((n, i) => (
          <Node key={n.label} cx={n.x} cy={y} kind={n.kind} delay={6 + i * 16} />
        ))}
      </svg>
      {nodes.map((n, i) => (
        <NodeLabel key={n.label} x={n.x} y={y + 150} delay={20 + i * 16}>
          {n.label}
        </NodeLabel>
      ))}
    </Scene>
  );
};

const lines = [
  {t: '$ iniciar processo', at: 10, color: C.accentSoft},
  {t: '▸ atendimento: ativo', at: 50, color: C.go},
  {t: '▸ aquisição de clientes: ativo', at: 74, color: C.go},
  {t: '✔ rodando sozinho', at: 104, color: C.accent},
];

export const TerminalScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = useEnter(0, 200);
  const cursorOn = Math.floor(frame / 15) % 2 === 0;
  return (
    <Scene>
      <Title top={430} size={58}>
        Quando botou pra rodar
      </Title>
      <div
        style={{
          position: 'absolute',
          top: 600,
          left: 80,
          right: 80,
          height: 620,
          borderRadius: 28,
          background: 'rgba(8,10,14,0.92)',
          border: `2px solid ${C.accent}66`,
          overflow: 'hidden',
          opacity: enter,
          transform: `scale(${0.96 + 0.04 * enter})`,
        }}
      >
        <div style={{display: 'flex', gap: 14, padding: '22px 26px', background: 'rgba(255,255,255,0.06)'}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <div key={c} style={{width: 22, height: 22, borderRadius: 11, background: c}} />
          ))}
        </div>
        <div style={{padding: '40px 44px', fontFamily: MONO, fontSize: 44, lineHeight: 1.7}}>
          {lines.map((l) => {
            const chars = Math.floor(
              interpolate(frame, [l.at, l.at + l.t.length * 1.1], [0, l.t.length], clamp),
            );
            if (frame < l.at) return null;
            const isLast = chars >= l.t.length;
            return (
              <div key={l.t} style={{color: l.color}}>
                {l.t.slice(0, chars)}
                {!isLast && cursorOn && <span style={{color: C.ink}}>▍</span>}
              </div>
            );
          })}
        </div>
      </div>
    </Scene>
  );
};

const pipeline = ['Aquisição de clientes', 'Atendimento de clientes', 'Entregáveis'];

export const PipelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.floor((frame - 20) / 34);
  const pulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.45, 1]);
  const badge = useEnter(60);
  return (
    <Scene>
      <Title top={430} size={58}>
        Rodando sozinho
      </Title>
      {pipeline.map((label, i) => {
        const p = useEnter(14 + i * 14);
        const on = active === i;
        const top = 600 + i * 230;
        return (
          <React.Fragment key={label}>
            <div
              style={{
                position: 'absolute',
                top,
                left: 110,
                right: 110,
                height: 150,
                borderRadius: 28,
                background: C.panel,
                border: `3px solid ${on ? C.accent : C.accent + '44'}`,
                boxShadow: on ? `0 0 60px ${C.accent}88` : 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '0 44px',
                fontFamily: FONT,
                fontSize: 46,
                fontWeight: 700,
                color: C.ink,
                opacity: p,
                transform: `translateX(${(1 - p) * -100}px) scale(${on ? 1.03 : 1})`,
              }}
            >
              <span style={{width: 18, height: 18, borderRadius: 9, background: C.accent, marginRight: 26, opacity: on ? 1 : 0.35}} />
              {label}
            </div>
            {i < pipeline.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: top + 150,
                  left: 538,
                  width: 4,
                  height: 100,
                  background: `${C.accent}66`,
                  opacity: p,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
      <div
        style={{
          position: 'absolute',
          top: 1250,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 700,
          color: C.accentSoft,
          opacity: badge * pulse,
        }}
      >
        ● processo ativo
      </div>
    </Scene>
  );
};

const rays = Array.from({length: 18}, (_, i) => {
  const a1 = ((i * 2) / 36) * Math.PI * 2;
  const a2 = (((i * 2) + 1) / 36) * Math.PI * 2;
  const r = 2200;
  return `M540 960 L${540 + Math.cos(a1) * r} ${960 + Math.sin(a1) * r} L${540 + Math.cos(a2) * r} ${960 + Math.sin(a2) * r} Z`;
});

export const OverdeliveryScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Scene>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`rotate(${frame * 0.8} 540 960)`} opacity={0.12}>
          {rays.map((d, i) => (
            <path key={i} d={d} fill={C.accent} />
          ))}
        </g>
      </svg>
      <div style={{position: 'absolute', top: 760, left: 0, right: 0, textAlign: 'center'}}>
        <AnimatedText
          transition={{opacity: [0, 1], scale: [0.7, 1], y: [30, 0], duration: 14, split: 'character', splitStagger: 1, easing: 'easeOutCubic'}}
          style={{fontFamily: FONT, fontSize: 132, fontWeight: 900, color: C.accent, letterSpacing: -4}}
        >
          OVERDELIVERY
        </AnimatedText>
      </div>
      <Title top={1060} delay={34} size={52}>
        Entrega absurda
      </Title>
    </Scene>
  );
};

export const CompareScene: React.FC = () => {
  const pay = useEnter(0, 200);
  const get = useEnter(12, 120);
  const barWidth = 280;
  const bottom = 1150;
  const bars = [
    {label: 'pelo que você paga', h: 260 * pay, color: C.mute, x: 170},
    {label: 'o que você recebe', h: 600 * get, color: C.accent, x: 630},
  ];
  return (
    <Scene>
      {bars.map((b) => (
        <React.Fragment key={b.label}>
          <div
            style={{
              position: 'absolute',
              left: b.x,
              top: bottom - b.h,
              width: barWidth,
              height: b.h,
              borderRadius: 26,
              background: b.color,
              boxShadow: b.color === C.accent ? `0 0 80px ${C.accent}77` : 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: b.x - 60,
              top: bottom + 28,
              width: barWidth + 120,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 38,
              fontWeight: 700,
              color: C.ink,
            }}
          >
            {b.label}
          </div>
        </React.Fragment>
      ))}
    </Scene>
  );
};
