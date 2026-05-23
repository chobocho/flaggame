import { GameEngine } from './engine/GameEngine';

const canvas = document.getElementById('game');
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas element #game not found');
}

const engine = new GameEngine(canvas);
engine.start();
