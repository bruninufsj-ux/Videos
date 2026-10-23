import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition id="Main" component={Main} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
