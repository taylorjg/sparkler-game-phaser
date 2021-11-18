import * as Phaser from 'phaser'

const OBSTACLE_LINE_WIDTH = 2

export class ObstaclePair {

  scene: Phaser.Scene
  obstacles: [Phaser.GameObjects.Polygon, Phaser.GameObjects.Polygon]

  public constructor(
    scene: Phaser.Scene,
    x: number,
    gapPercent: number
  ) {
    this.scene = scene

    const obstacleWidth = this.getObstacleWidth()

    const RADIUS = obstacleWidth / 2

    const windowHeight = window.innerHeight
    const gapHeight = windowHeight * gapPercent / 100
    const halfRemainingHeight = (windowHeight - gapHeight) / 2
    const centreOffsetRatio = Phaser.Math.FloatBetween(-0.5, 0.5)
    const upperHeight = (1 + centreOffsetRatio) * halfRemainingHeight
    const lowerHeight = (1 - centreOffsetRatio) * halfRemainingHeight

    const upperObstacle = this.makeObstacle((path: Phaser.Curves.Path): void => {
      path
        .moveTo(x, 0)
        .lineTo(x, upperHeight - RADIUS)
        .ellipseTo(RADIUS, RADIUS, 180, 0, true)
        .lineTo(x + obstacleWidth, 0)
    })

    const lowerObstacle = this.makeObstacle((path: Phaser.Curves.Path): void => {
      path
        .moveTo(x, windowHeight)
        .lineTo(x, windowHeight - lowerHeight + RADIUS)
        .ellipseTo(RADIUS, RADIUS, 180, 0, false)
        .lineTo(x + obstacleWidth, windowHeight)
    })

    this.obstacles = [upperObstacle, lowerObstacle]
  }

  public contains(x: number, y: number): boolean {
    return this.obstacles.some(obstacle => obstacle.geom.contains(x, y))
  }

  public rightSatisfies(predicate: (x: number) => boolean): boolean {
    return this.obstacles.some(obstacle => {
      const right = Phaser.Geom.Polygon.GetAABB(obstacle.geom).right
      return predicate(right)
    })
  }

  public destroy() {
    this.obstacles.forEach(obstacle => obstacle.destroy())
  }

  public resize(ratioX: number, ratioY: number) {
    console.log('[ObstaclePair#resize]', {ratioX, ratioY})
    const scrollX = this.scene.cameras.main.scrollX
    const makeNewPolygon = obstacle => {
      const geom = obstacle.geom as Phaser.Geom.Polygon
      const pointsNew = geom.points.map(pt => ({
        x: ((pt.x - scrollX) * ratioX) + scrollX,
        y: pt.y * ratioY
      }))
      const polygon = this.scene.add.polygon(0, 0, pointsNew)
      polygon.closePath = false
      polygon.setOrigin(0, 0)
      polygon.isStroked = true
      polygon.lineWidth = OBSTACLE_LINE_WIDTH
      polygon.strokeColor = 0xFFFFFF
      return polygon
    }
    const obstaclesNew = this.obstacles.map(makeNewPolygon)
    this.obstacles.forEach(obstacle => obstacle.destroy())
    this.obstacles = [obstaclesNew[0], obstaclesNew[1]]
  }

  public get overallWidth() {
    return this.getObstacleWidth() + OBSTACLE_LINE_WIDTH
  }

  private makeObstacle(
    addPathDetails: (path: Phaser.Curves.Path) => void
  ): Phaser.GameObjects.Polygon {
    const path = new Phaser.Curves.Path()
    addPathDetails(path)
    const points = path.getPoints()
    const polygon = this.scene.add.polygon(0, 0, points)
    polygon.closePath = false
    polygon.setOrigin(0, 0)
    polygon.isStroked = true
    polygon.lineWidth = OBSTACLE_LINE_WIDTH
    polygon.strokeColor = 0xFFFFFF
    return polygon
  }

  private getObstacleWidth() {
    const windowWidth = window.innerWidth
    return Math.round(windowWidth / 20)
  }
}
