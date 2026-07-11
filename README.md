# Description

This is my attempt to recreate Seb Lee-Delisle's interactive sparkler game as seen in the second of the Royal Institution Christmas lectures with Dr Hannah Fry on 27 December 2019. The game used the audience noise level to guide a sparkler between a scrolling sequence of obstacles.

![Stills Collage](images/stills-collage.jpg)

# Playing Instructions

You can control the game in one of the following ways:

* Using the UP ARROW key
* By clicking/tapping the window
* By making some noise (after turning on the microphone by clicking the icon in the bottom right corner of the window)

# Dev Instructions

Requires Node 18 or later.

## Running Locally

```
npm install
npm run dev
```

Opens at http://localhost:5173/sparkler-game-phaser/

## Building

```
rm -rf dist
npm run build
```

## Deploying (to gh-pages)

```
npm run deploy
```

# Links

* [Christmas Lectures 2019: How to Bend the Rules - Hannah Fry](https://youtu.be/TtisQ9yZ2zo?t=563)
* [Christmas Lectures 2019 Secrets and lies](https://www.rigb.org/christmas-lectures/watch/2019/secrets-and-lies)
* [Seb Lee-Delisle &#8211; Laser artist and presenter](https://seblee.me/)
* Phaser:
  * [Phaser - A fast, fun and free open source HTML5 game framework](https://phaser.io/)
  * [Phaser API Documentation](https://docs.phaser.io/)
* My earlier attempt using only vanilla JavaScript:
  * [sparkler-game](https://github.com/taylorjg/sparkler-game)
