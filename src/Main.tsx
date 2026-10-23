import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {AnimatedText} from './motion';
import {segments} from './data/transcript';
import {toFrame} from './timeline';
import {CompareScene, AutomationScene, OverdeliveryScene, PillarsScene, PipelineScene, TerminalScene} from './graphics';
import {C, FONT} from './style';

// Scene boundaries follow the transcript's sentence breaks, so each graphic
// lands on the phrase it illustrates.
const scenes: {start: number; end: number; Component: React.FC}[] = [
  {start: 0.0, end: 11.16, Component: PillarsScene},
  {start: 11.16, end: 22.92, Component: AutomationScene},
  {start: 22.92, end: 30.04, Component: TerminalScene},
  {start: 30.04, end: 43.48, Component: PipelineScene},
  {start: 43.48, end: 49.14, Component: OverdeliveryScene},
  {start: 49.14, end: 53.44, Component: CompareScene},
];

const CaptionCard: React.FC<{text: string}> = ({text}) => (
  <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 250}}>
    <div
      style={{
        maxWidth: 940,
        padding: '24px 32px',
        borderRadius: 26,
        background: 'rgba(0,0,0,0.6)',
        textAlign: 'center',
      }}
    >
      <AnimatedText
        transition={{opacity: [0, 1], blur: [8, 0], y: [16, 0], duration: 8, split: 'word', splitStagger: 1, easing: 'easeOutCubic'}}
        style={{fontFamily: FONT, fontSize: 50, fontWeight: 700, color: C.ink, lineHeight: 1.3}}
      >
        {text}
      </AnimatedText>
    </div>
  </AbsoluteFill>
);

export const Main: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('source.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, rgba(8,10,16,0.5) 0%, rgba(8,10,16,0.62) 55%, rgba(8,10,16,0.9) 100%)',
      }}
    />
    {scenes.map(({start, end, Component}) => (
      <Sequence key={start} from={toFrame(start)} durationInFrames={toFrame(end) - toFrame(start)}>
        <Component />
      </Sequence>
    ))}
    {segments.map((s) => (
      <Sequence key={s.start} from={toFrame(s.start)} durationInFrames={toFrame(s.end) - toFrame(s.start)}>
        <CaptionCard text={s.text} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
