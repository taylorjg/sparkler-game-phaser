import './AudioContextMonkeyPatch'
import * as Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'
import { GameScene } from './game'
import { HUDScene } from './hud'

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sparkler Game',
  type: Phaser.AUTO,
  scale: {
    width: window.innerWidth,
    height: window.innerHeight,
    mode: Phaser.Scale.NONE,
    fullscreenTarget: 'game'
  },
  backgroundColor: '#000000',
  scene: [GameScene, HUDScene],
  parent: 'game',
  dom: {
    createContainer: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300
      },
      debug: true
    }
  },
  plugins: {
    scene: [{
      key: 'rexUI',
      plugin: RexUIPlugin,
      mapping: 'rexUI'
    }]
  }
}

const main = () => {
  new Phaser.Game(gameConfig)
}

main()
