import * as Phaser from 'phaser'

export type AnchorConfig = {
  left?: string
  right?: string
  top?: string
  bottom?: string
  centerX?: 'center'
  centerY?: 'center'
}

type Transform = Phaser.GameObjects.GameObject &
  Phaser.GameObjects.Components.Transform &
  Phaser.GameObjects.Components.ComputedSize

const hasSetOrigin = (
  gameObject: Transform
): gameObject is Transform & Phaser.GameObjects.Components.Origin =>
  typeof (gameObject as Phaser.GameObjects.Components.Origin).setOrigin === 'function'

const parseEdgeOffset = (value: string, size: number): number => {
  if (value.startsWith('left+')) {
    return Number.parseInt(value.slice(5), 10)
  }
  if (value.startsWith('top+')) {
    return Number.parseInt(value.slice(4), 10)
  }
  if (value.startsWith('right-')) {
    return size - Number.parseInt(value.slice(6), 10)
  }
  if (value.startsWith('bottom-')) {
    return size - Number.parseInt(value.slice(7), 10)
  }
  return 0
}

export const applyAnchor = (
  scene: Phaser.Scene,
  gameObject: Transform,
  anchor: AnchorConfig
): void => {
  const width = scene.scale.width
  const height = scene.scale.height

  let anchorX = 0.5
  let anchorY = 0.5
  let targetX = gameObject.x
  let targetY = gameObject.y

  if (anchor.left !== undefined) {
    targetX = parseEdgeOffset(anchor.left, width)
    anchorX = 0
  } else if (anchor.centerX === 'center') {
    targetX = width / 2
    anchorX = 0.5
  } else if (anchor.right !== undefined) {
    targetX = parseEdgeOffset(anchor.right, width)
    anchorX = 1
  }

  if (anchor.top !== undefined) {
    targetY = parseEdgeOffset(anchor.top, height)
    anchorY = 0
  } else if (anchor.centerY === 'center') {
    targetY = height / 2
    anchorY = 0.5
  } else if (anchor.bottom !== undefined) {
    targetY = parseEdgeOffset(anchor.bottom, height)
    anchorY = 1
  }

  if (hasSetOrigin(gameObject)) {
    gameObject.setPosition(targetX, targetY)
    gameObject.setOrigin(anchorX, anchorY)
    return
  }

  const container = gameObject as Phaser.GameObjects.Container
  const bounds = container.getBounds()
  const anchorPointX = bounds.x + bounds.width * anchorX
  const anchorPointY = bounds.y + bounds.height * anchorY

  container.setPosition(
    targetX + (container.x - anchorPointX),
    targetY + (container.y - anchorPointY)
  )
}

export const layoutVertical = (
  children: Phaser.GameObjects.GameObject[],
  spacing: number
): number => {
  let y = 0
  let maxWidth = 0

  children.forEach(child => {
    const sizedChild = child as Transform
    sizedChild.setPosition(0, y)
    y += sizedChild.displayHeight + spacing
    maxWidth = Math.max(maxWidth, sizedChild.displayWidth)
  })

  children.forEach(child => {
    const sizedChild = child as Transform
    sizedChild.x += (maxWidth - sizedChild.displayWidth) / 2
  })

  return y - spacing
}

export const createAnchoredContainer = (
  scene: Phaser.Scene,
  children: Phaser.GameObjects.GameObject[],
  anchor: AnchorConfig,
  spacing = 0
): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0, children)

  if (spacing > 0) {
    layoutVertical(children, spacing)
  }

  applyAnchor(scene, container, anchor)
  return container
}
