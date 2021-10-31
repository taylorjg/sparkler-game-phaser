import * as Phaser from 'phaser'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin'

export type SceneWithRexUI = Phaser.Scene & { rexUI: RexUIPlugin }
