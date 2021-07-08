let width = 800,
  height = 600,
  gLoop,
  can = document.getElementById("canvas"),
  ctx = can.getContext("2d");

can.width = width;
can.height = height;

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function () {
    this.sound.play();
  };
  this.stop = function () {
    this.sound.pause();
  };
  this.setCurrentTime = function (t) {
    this.sound.currentTime = t;
  };
  this.setVolume = function (v) {
    this.sound.volume = v;
  };
}

let jetBlast = new sound("sounds/comedy_missle.mp3");
let bkgMusic = new sound("sounds/smoke_a_lie.mp3");
let endSound;

function backgroundMusic() {
  bkgMusic.setVolume(0.5);
  bkgMusic.play();
}
setTimeout(backgroundMusic, 2000);

let points = document.querySelector("#points span");
function updatePoints() {
  points.innerHTML = frameCounter;
}

let clear = function () {
  ctx.fillStyle = "#d0e7f9";
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.closePath();
  ctx.fill();
};

let bkg = new Image();
bkg.src = "gameImages/bgClouds.jpg";
let bkgHeight = 0;
let scrollSpeed = 1;

function drawBackground() {
  ctx.drawImage(bkg, 0, bkgHeight);
  ctx.drawImage(bkg, 0, bkgHeight - can.height);
  bkgHeight += scrollSpeed;
  if (bkgHeight == can.height - 100) bkgHeight = 0;
}

// here we used class instead
let player = new (function () {
  this.image = new Image();
  this.image.src = "gameImages/jetboyChar.png";

  this.thrustJets = new Image();
  this.thrustJets.src = "gameImages/jetboy.png";

  this.leftJets = new Image();
  this.leftJets.src = "gameImages/jetboyLt.png";

  this.rightJets = new Image();
  this.rightJets.src = "gameImages/jetboyRt.png";

  this.width = 75;
  this.height = 100;
  this.frames = 1;
  // Initial Position
  this.posX = 0;
  this.posY = 0;
  // Initial Angle
  this.angle = 0;
  // Intial Velocity
  this.velX = 0;
  this.velY = 0;
  this.engineOn = false;
  this.thrust = -0.5;
  this.flyingLeft = false;
  this.flyingRight = false;
  this.points = 0;
  this.isFalling = false;
  this.fallSpeed = 0;
  this.fallStop = function () {
    this.isFalling = false;
    this.fallSpeed = 0;
  };

  this.checkFall = function () {
    if (this.posY < height - this.height) {
      this.setPosition(this.posX, this.posY + this.fallSpeed);
      this.fallSpeed++;
    } else {
      this.fallStop();
    }
  };

  this.setPosition = function (x, y) {
    this.posX = x;
    this.posY = y;
  };

  this.boundaries = function () {
    if (this.posX < 0) {
      this.posX = 0;
    }

    if (this.posX + this.width > can.width) {
      this.posX = can.width - this.width;
    }

    if (this.posY < 0) {
      this.posY = ~~0;
    }

    if (this.posY + this.height > can.height) {
      this.posY = can.height - this.height;
    }
  };

  this.interval = 0;

  // 60 times per second
  this.draw = function () {
    if (this.engineOn) {
      ctx.drawImage(this.thrustJets, this.posX, this.posY, this.width, this.height);
    }
    if (this.flyingLeft) {
      ctx.drawImage(this.leftJets, this.posX, this.posY, this.width, this.height);
    }
    if (this.flyingRight) {
      ctx.drawImage(this.rightJets, this.posX, this.posY, this.width, this.height);
    } else {
      ctx.drawImage(this.image, this.posX, this.posY, this.width, this.height);
    }
    // ctx.drawImage(this.image, 0, this.height * this.actualFrame, this.width, this.height, this.posX, this.posY, this.width, this.height);
  };
  let gravity = 0.1;

  this.updatePlayer = function () {
    player.posX += player.velX;
    player.posY += player.velY;
    if (player.flyingRight) {
      this.posX + this.width < width;
      this.setPosition(this.posX + 5, this.posY);
    } else if (player.flyingLeft) {
      this.posX > 0;
      this.setPosition(this.posX - 5, this.posY);
    }
    if (player.engineOn) {
      player.velX += player.thrust * Math.sin(-player.angle);
      player.velY += player.thrust * Math.cos(player.angle);
    }
    player.velY += gravity;
  };
})();

player.setPosition(~~((width - player.width) / 2), Math.floor((height - player.height) / 2));

let nrOflandings = 2;
let arrayOfClouds = [];
let landingWidth = 150;
let landingHeight = 20;
let frameCounter = 0;
let smCloud2 = new Image();
smCloud2.src = "gameImages/cloudSmTwo.png";

class Landing {
  constructor(x, y, cloudType) {
    this.x = Math.floor(x);
    this.y = y;
    this.type = cloudType;
    this.onContact = function () {
      player.fallStop();
    };
  }

  draw() {
    ctx.drawImage(smCloud2, this.x, this.y);
    // ctx.strokeRect(this.x + 40, this.y, landingWidth - 40, landingHeight);
  }
}

let checkCollision = function () {
  arrayOfClouds.forEach(function (cloud, ind) {
    //check every landing
    if (
      player.posX < cloud.x + landingWidth - 40 &&
      player.posX + player.width > cloud.x + 40 &&
      player.posY + player.height > cloud.y &&
      player.posY < cloud.y + landingHeight
      //and is directly over the platform
    ) {
      console.log("contact");
      // alert("contact !");
      cloud.onContact();
      GameOver();
    }
  });
};

let endGame = new Image();
endGame.src = "gameImages/gameOver.png";
//GameOver screen

function GameOver() {
  bkgMusic.volume = 0;
  bkgMusic.stop();
  //checkCollision();
  clear();
  gameOverBool = true;
  ctx.fillStyle = "Black";
  ctx.font = "20pt Arial";
  ctx.drawImage(endGame, 200, 200, 400, 180);
  ctx.fillText("YOUR SCORE: " + (frameCounter - 1), 250, 410);
  endSound = new sound("sounds/cartoon_fail.mp3");
  endSound.play();
}

let cloudSpeed = 1;

let gameOverBool = false;
let GameLoop = function () {
  if (gameOverBool) return;

  clear();
  updatePoints();
  drawBackground();

  if (player.isFalling) player.checkFall();
  player.updatePlayer();
  player.draw();
  player.boundaries();
  
  arrayOfClouds.forEach(function (landing) {
    landing.y += cloudSpeed;
    landing.draw();
  });
  hitBottom();

  // 2 seconds have passed - Left side Obstacles
  if (frameCounter % Math.floor(240 / cloudSpeed) === 0) {
    arrayOfClouds.push(new Landing(Math.random() * (width - landingWidth), -80));
    arrayOfClouds.push(new Landing(Math.random() * (width - landingWidth), -80));
  }

  if (frameCounter % 200 === 0) {
    cloudSpeed *= 1.25;
  }

  frameCounter += 1;

  checkCollision();

  gLoop = setTimeout(GameLoop, 1000 / 60);

};

function hitBottom() {
  //let rockbottom = can.height / 2 + 200;
  let rockbottom = can.height;
  if (player.posY + player.height >= rockbottom) {
    player.posY = rockbottom - player.height;
    gravity = 0;
  } else {
    gravity = 0.05;
  }
}

document.onkeyup = function (event) {
  switch (event.keyCode) {
    case 37:
      player.flyingLeft = false;
      break;
    case 39:
      player.flyingRight = false;
      break;
    case 38:
      player.engineOn = false;
      break;
  }
};

document.onkeydown = function (event) {
  //   console.log("event.keyCode", event.keyCode);
  switch (event.keyCode) {
    case 37:
      player.flyingLeft = true;
      jetBlast.setCurrentTime(0);
      jetBlast.setVolume(0.5);
      jetBlast.play();

      break;
    case 39:
      player.flyingRight = true;
      jetBlast.setCurrentTime(0);
      jetBlast.setVolume(0.5);
      jetBlast.play();
      break;
    case 38:
      player.engineOn = true;
      jetBlast.setCurrentTime(0);
      jetBlast.setVolume(0.5);
      jetBlast.play();
      break;
  }
};

GameLoop();
