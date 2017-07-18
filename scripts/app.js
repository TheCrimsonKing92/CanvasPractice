(function() {
    let self = this;

    const CLOUD_COLUMNS = 32;
    const CLOUD_ROWS = 12;
    const CLOUD_TEMPLATE = [
        {
            height: 13,
            name: 'cloud1',
            width: 36
        },
        {
            height: 10,
            name: 'cloud2',
            width: 16
        },
        {
            height: 15,
            name: 'cloud3',
            width: 44
        }
    ];
    const DEFAULT_X_SCROLL = 20;
    const DEFAULT_Y_SCROLL = 10;
    const GRASS_BACKGROUND_COLOR = '#458B00';
    const GRASS_BLADE_COLOR = '#4A7023';
    const GRASS_BLADE_HEIGHT = 5;
    const GRASS_BLADE_SHADOW_COLOR = '#7F9A65';
    const GRASS_BLADE_WIDTH = 1;    
    const GRASS_HEIGHT = 100;
    const GRASS_WIDTH = 600;
    const KEY_DOWN = '40';
    const KEY_ENTER = '13';
    const KEY_LEFT = '37';
    const KEY_RIGHT = '39';
    const KEY_SPACE = '32';
    const KEY_UP = '38';
    const MENU_HEIGHT = 200;
    const PAUSE_BUTTON_X = 10;
    const PAUSE_BUTTON_Y = 10;
    const PAUSE_BUTTON_HEIGHT = 50;
    const PAUSE_BUTTON_WIDTH = 35;
    const PLAYER_FALL_LENGTH = 10;
    const PLAYER_FALL_SPEED = 10;
    const PLAYER_HANG_LENGTH = 13;
    const PLAYER_HEIGHT = 80;
    const PLAYER_MOVE_LEFT_SPEED = -5;
    const PLAYER_MOVE_LENGTH = 10;
    const PLAYER_MOVE_RIGHT_SPEED = 5;
    const PLAYER_MOVE_WIDTH = 50;
    const PLAYER_JUMP_LENGTH = 10;
    const PLAYER_JUMP_SPEED = -10;
    const PLAYER_STARTING_X = 279;
    const PLAYER_STARTING_Y = 320;
    const PLAYER_WIDTH = 21;
    const PLAYER_X_MIN = 42;
    const PLAYER_X_MAX = 537;
    const PLAYER_Y_MIN = 0;
    const PLAYER_Y_MAX = 320;
    const SCREEN_HEIGHT = 400;
    const SCREEN_MOVE_LEFT_SPEED = 2;
    const SCREEN_MOVE_LENGTH = 10;
    const SCREEN_MOVE_RIGHT_SPEED = -2;
    const SCREEN_PADDING_LEFT = 300;
    const SCREEN_PADDING_RIGHT = 300;
    const SCREEN_STARTING_X = -300;
    const SCREEN_STARTING_Y = -180;
    const SCREEN_VERTICAL_MOVE_LENGTH = 10;
    const SCREEN_VERTICAL_MOVE_SPEED = 2;
    const SCREEN_WIDTH = 600;
    const SCREEN_X_MIN = -600;
    const SCREEN_X_MAX = 0;
    const SCREEN_Y_MIN = -180;
    const SCREEN_Y_MAX = 0;
    const SCREEN_BOUNDS = {
        x: {
            min: 0,
            max: SCREEN_WIDTH
        },
        y: {
            min: 0,
            max: SCREEN_HEIGHT
        }
    };
    const SKY_COLOR = '#4061ed';
    const SKY_DRAW_HEIGHT = 90;
    const SKY_HEIGHT = 270;
    const SKY_WIDTH = SCREEN_WIDTH + SCREEN_PADDING_LEFT + SCREEN_PADDING_RIGHT;
    const X_MIN = -300;
    const X_MAX = 300;
    const Y_MIN = -100;
    const Y_MAX = 100;

    //fields
    self.clouds = [];
    self.collidables = [];
    self.drawOverride = false;
    self.dt = 0;
    self.gameCanvas = funcs.select('.game');
    self.gameContext = self.gameCanvas.getContext('2d');
    self.gameFrame = null;
    self.grassBlades = [];
    self.ground = {
        move: function(x, y) {
            if (x > 0) this.x = this.x + x > SCREEN_X_MAX ? SCREEN_X_MAX : this.x + x;
            else if (x < 0) this.x = this.x + x < SCREEN_X_MIN ? SCREEN_X_MIN : this.x + x;

            if (this.x === SCREEN_X_MAX) this.bounded.right = true;
            else this.bounded.right = false;

            if (this.x === SCREEN_X_MIN) this.bounded.left = true;
            else this.bounded.left = false;

            if (y > 0) this.y = this.y + y > SCREEN_Y_MAX ? SCREEN_Y_MAX : this.y + y;
            else if (y < 0) this.y = this.y + y < SCREEN_Y_MIN ? SCREEN_Y_MIN : this.y + y;

            if (this.y === SCREEN_Y_MAX) this.bounded.down = true;
            else this.bounded.down = false;

            if (this.y === SCREEN_Y_MIN) this.bounded.up = true;
            else this.bounded.up = false;
        },
        movingLeft: false,
        movingRight: false,
        movetime: 0,
        x: 0,
        y: SCREEN_HEIGHT - GRASS_HEIGHT
    };
    self.groundCanvas = funcs.select('.ground');
    self.groundContext = self.groundCanvas.getContext('2d');
    self.keyMap = {};
    self.menuCanvas = funcs.select('.menu');
    self.menuContext = self.menuCanvas.getContext('2d');
    self.objects = [];
    self.pauseCanvas = funcs.select('.pause');
    self.pauseContext = self.pauseCanvas.getContext('2d');
    self.playCanvas = funcs.select('.play');
    self.playContext = self.playCanvas.getContext('2d');
    self.player = {
        bouncing: false,
        bouncespeed: 0,
        bouncetime: 0,
        bounded: {
            down: false,
            left: false,
            right: false,
            up: false
        },
        canJump: function() {
            return !this.jumping &&
                   !this.hanging &&
                   !this.falling;
        },
        falling: false,
        falltime: 0,
        hanging: false,
        hangtime: 0,
        isBoundedLeft: function () {
            return this.bounded.left;
        },
        isBoundedRight: function () {
            return this.bounded.right;
        },
        jump: function() {
            this.jumping = true;
            this.jumptime = PLAYER_JUMP_LENGTH;
            this.hanging = false;
            this.hangtime = PLAYER_HANG_LENGTH;
            this.falling = false;
            this.falltime = PLAYER_FALL_LENGTH;
        },
        jumping: false,
        jumptime: 0,
        move: function(x, y) {
            if (x > 0) this.x = this.x + x > PLAYER_X_MAX ? PLAYER_X_MAX : this.x + x;
            else if (x < 0) this.x = this.x + x < PLAYER_X_MIN ? PLAYER_X_MIN : this.x + x;

            if (this.x === PLAYER_X_MAX) this.bounded.right = true;
            else this.bounded.right = false;

            if (this.x === PLAYER_X_MIN) this.bounded.left = true;
            else this.bounded.left = false;

            if (y > 0) this.y = this.y + y > PLAYER_Y_MAX ? PLAYER_Y_MAX : this.y + y;
            else if (y < 0) this.y = this.y + y < PLAYER_Y_MIN ? PLAYER_Y_MIN : this.y + y;

            if (this.y === PLAYER_Y_MAX) this.bounded.down = true;
            else this.bounded.down = false;

            if (this.y === PLAYER_Y_MIN) this.bounded.up = true;
            else this.bounded.up = false;
        },
        movetime: 0,
        moveLeft: function() {
            this.movingLeft = true;
            this.movetime = PLAYER_MOVE_LENGTH;
        },
        movingLeft: false,
        moveRight: function() {
            this.movingRight = true;
            this.movetime = PLAYER_MOVE_LENGTH;
        },
        movingRight: false,
        resetStage: function(type) {
            if (type === 'jump'){
                this.jumping = false;
                this.jumptime = 0;
                this.hanging = false;
                this.hangtime = 0;
                this.falling = false;
                this.falltime = 0;
            }

            else if (type === 'move') {
                this.movingLeft = false;
                this.movingRight = false;
                this.movetime = 0;
            }
        },
        stopMoving: function() {
            this.movingleft = false;
            this.movingRight = false;
            this.movetime = 0;
        },
        transitionStage: function(type, steps) {
            if (type === 'jump'){
                let fullTime = this.jumptime + this.hangtime + this.falltime;

                if (this.jumping) {
                    if (steps > fullTime) {
                        this.resetStage(type);
                        y += (PLAYER_STARTING_Y - self.player.y);
                    }

                    else if (steps > self.player.jumptime + self.player.hangtime) {
                        //jump up and hang are done by the time we re-render
                        //allocate remainder to falling
                        let diff = steps - (self.player.jumptime + self.player.hangtime);
                        let jumpChange = PLAYER_JUMP_SPEED * self.player.jumptime;

                        self.player.jumptime = 0;
                        self.player.jumping = false;

                        self.player.hangtime = 0;

                        self.player.falltime -= diff;
                        //console.log('Falltime left: ' + self.player.falltime);
                        self.player.falling = self.player.falltime > 0;

                        let fallChange = PLAYER_FALL_SPEED * diff;

                        y += (jumpChange + fallChange);
                    }

                    else if (steps > self.player.jumptime) {
                        //jump up is done by the time we re-render
                        //so add those then hang
                        let diff = steps - self.player.jumptime;
                        let jumpChange = PLAYER_JUMP_SPEED * self.player.jumptime;

                        self.player.jumptime = 0;
                        self.player.jumping = false;

                        self.player.hangtime -= diff;
                        self.player.hanging = self.player.hangtime > 0;

                        y += jumpChange;
                    }

                    else {
                        self.player.jumptime -= steps;
                        if (self.player.jumptime < 1) {
                            self.player.jumping = false;
                            self.player.jumptime = 0;
                            self.player.hanging = true;
                        }

                        y += (PLAYER_JUMP_SPEED * steps);
                    }
                }

                else if (self.player.hanging) {  
                    //jump is over, reset to ground level
                    if (steps > self.player.hangtime + self.player.falltime) {
                        self.player.jumping = false;
                        self.player.jumptime = 0;
                        self.player.hanging = false;
                        self.player.hangtime = 0;
                        self.player.falling = false;
                        self.player.falltime = 0;
                        y = PLAYER_STARTING_Y - self.player.y
                    }

                    //hang is over, start fall
                    else if (steps > self.player.hangtime) {
                        let diff = steps - self.player.hangtime;
                        self.player.hanging = false;
                        self.player.hangtime = 0;
                        self.player.falltime -= diff;
                        self.player.falling = self.player.falltime > 0;
                        y = PLAYER_FALL_SPEED * diff;
                    }

                    //hang
                    else self.player.hangtime -= steps;
                }

                else if (self.player.falling) {
                    if (steps >= self.player.falltime) {
                        y = PLAYER_FALL_SPEED * self.player.falltime;
                        self.player.falling = false;
                        self.player.falltime = 0;
                    }

                    else {
                        self.player.falltime -= steps;
                        y = PLAYER_FALL_SPEED * steps;
                    }
                }
            }

            else if (type === 'move') {

            }
        },
        x: PLAYER_STARTING_X,
        y: PLAYER_STARTING_Y
    },
    self.paused = false;
    self.screen = {
        bounded: {
            down: false,
            left: false,
            right: false,
            up: false
        },
        canMove: function() {
            return !this.movingLeft &&
                   !this.movingRight &&
                   !this.movingUp &&
                   !this.movingDown;
        },
        move: function(x, y) {
            if (x > 0) this.x = this.x + x > SCREEN_X_MAX ? SCREEN_X_MAX : this.x + x;
            else if (x < 0) this.x = this.x + x < SCREEN_X_MIN ? SCREEN_X_MIN : this.x + x;

            if (this.x === SCREEN_X_MAX) this.bounded.right = true;
            else this.bounded.right = false;

            if (this.x === SCREEN_X_MIN) this.bounded.left = true;
            else this.bounded.left = false;

            if (y > 0) this.y = this.y + y > SCREEN_Y_MAX ? SCREEN_Y_MAX : this.y + y;
            else if (y < 0) this.y = this.y + y < SCREEN_Y_MIN ? SCREEN_Y_MIN : this.y + y;

            if (this.y === SCREEN_Y_MAX) this.bounded.up = true;
            else this.bounded.down = false;

            if (this.y === SCREEN_Y_MIN) this.bounded.down = true;
            else this.bounded.up = false;
        },
        moveDown: function() {
            this.movingDown = true;
            this.movetime = SCREEN_MOVE_LENGTH;
        },
        moveLeft: function() {
            this.movingLeft = true;
            this.movetime = SCREEN_MOVE_LENGTH;
        },
        moveRight: function() {
            this.movingRight = true;
            this.movetime = SCREEN_MOVE_LENGTH;
        },
        moveUp: function() {
            this.movingUp = true;
            this.movetime = SCREEN_MOVE_LENGTH;
        },
        movingDown: false,
        movingLeft: false,
        movingRight: false,
        movingUp: false,
        movetime: 0,
        stopMoving: function() {
            this.movingDown = false;
            this.movingLeft = false;
            this.movingRight = false;
            this.movingUp = false;
            this.movetime = 0;
        },
        x: SCREEN_STARTING_X,
        y: SCREEN_STARTING_Y
    };
    self.shadowBlades = [];
    self.skyCanvas = funcs.select('.sky');
    self.skyContext = self.skyCanvas.getContext('2d');
    self.step = 1000/60;
    self.xscroll = 0;
    self.yscroll = 0;

    //methods

    self.bindEvents = function() {
        window.onkeydown = window.onkeyup = self.mapKey;
        self.gameCanvas.onclick = self.handleClick;
    };

    self.checkPlayerXBound = function(x){
        if (x === 0) return x;

        else if (x < 0) {
            if (self.player.bounded.left) return 0;

            let rem = self.player.x - PLAYER_X_MIN;
            return x > rem ? rem : x;
        }

        if (self.player.bounded.right) return 0;

        let rem = PLAYER_X_MAX - self.player.x;
        return x > rem ? rem : x;
    };

    self.checkPlayerYBound = function(y) {
        return y;
    };

    self.checkScreenXBound = function(x) {
        if (x === 0) return x;

        else if (x < 0) {
            if (self.screen.bounded.left) return 0;

            let rem = self.screen.x - SCREEN_X_MIN;
            return x > rem ? rem : x;
        }

        if (self.screen.bounded.right) return 0;

        let rem = SCREEN_X_MAX - self.screen.x;
        return x > rem ? rem : x;
    };

    self.checkScreenYBound = function(y) {
        if (y === 0) return y;

        else if (y < 0) {
            if (self.screen.bounded.down) return 0;

            let rem = self.screen.y - SCREEN_Y_MIN;
            return y > rem ? rem : y;
        }

        if (self.screen.bounded.up) return 0;

        let rem = SCREEN_Y_MAX - self.screen.x;
        return y > rem ? rem : y;
    };

    self.clickObjects = function(clickPosition){
        self.objects.filter((ob) => {
            return clickPosition.x >= ob.x.min &&
                   clickPosition.x <= ob.x.max &&
                   clickPosition.y >= ob.y.min &&
                   clickPosition.y <= ob.y.max;
        }).forEach((ob) => ob.onClick());
    };

    self.draw = function() {
        if (!self.drawOverride) {
            self.setBase();
            self.drawMenu();
            self.mergeSecondaries();
            self.drawPlayer();
        }
    };

    self.drawCloud = function(cloud) {
        var img = new Image();
        img.onload = function() {
            self.skyContext.drawImage(img, cloud.x, cloud.y);
        };
        img.src = cloud.src;
    };
    
    self.drawGrassBackground = function() {
        self.groundContext.fillStyle = GRASS_BACKGROUND_COLOR;
        self.groundContext.fillRect(0, 0, 1200, 100);
    };

    self.drawGrassBlades = function() {
        self.grassBlades.forEach((blade) => {
            self.groundContext.fillStyle = GRASS_BLADE_COLOR;
            self.groundContext.fillRect(blade.x, blade.y, GRASS_BLADE_WIDTH, GRASS_BLADE_HEIGHT);
        });
        self.shadowBlades.forEach((blade) => {
            self.groundContext.fillStyle = GRASS_BLADE_SHADOW_COLOR;
            self.groundContext.fillRect(blade.x, blade.y, GRASS_BLADE_WIDTH, blade.adjustment > 0? (GRASS_BLADE_HEIGHT - blade.adjustment) : GRASS_BLADE_HEIGHT);
        });
    };

    self.drawGrass = function() {
        self.drawGrassBackground();
        self.drawGrassBlades();
    };

    self.drawImage = function(context, image) {
        let img = new Image();
        img.onload = function() {
            context.drawImage(img, 0, 0);
        };
        img.src='img/' + image + '.png';
    };

    self.drawMenu = function() {
        self.menuContext.clearRect(0, 0, self.menuCanvas.width, self.menuCanvas.height);

        self.objects = [];

        if (self.paused) self.drawPlayButton();
        else self.drawPauseButton();

        self.objects.push({
            onClick: self.pauseGame,
            x: {
                min: PAUSE_BUTTON_X,
                max: PAUSE_BUTTON_X + PAUSE_BUTTON_WIDTH
            },
            y: {
                min: PAUSE_BUTTON_Y,
                max: PAUSE_BUTTON_Y + PAUSE_BUTTON_HEIGHT
            }
        });
    };

    self.drawPauseButton = function() {
        self.menuContext.drawImage(self.pauseCanvas, PAUSE_BUTTON_X, PAUSE_BUTTON_Y);
    };

    self.drawPlayButton = function() {
        self.menuContext.drawImage(self.playCanvas, PAUSE_BUTTON_X, PAUSE_BUTTON_Y);
    };

    self.drawPlayer = function() {
        self.gameContext.fillStyle = 'RED';
        self.gameContext.fillRect(self.player.x, self.player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    };

    self.drawSecondaries = function() {
        self.drawSky();
        self.drawMenu();
        self.drawGrass();
    };

    self.drawSkyBackground = function() {
        self.skyContext.fillStyle = SKY_COLOR;
        self.skyContext.fillRect(0, 0, SKY_WIDTH, SKY_HEIGHT);
    };

    self.drawSkyClouds = function() {
        self.clouds.forEach((cloud) => {
            let img = new Image();
            img.onload = function() {
                self.skyContext.drawImage(img, cloud.x, cloud.y);
            };
            img.src = cloud.src;
        });
    };

    self.drawSky = function() {
        self.drawSkyBackground();
        self.drawSkyClouds();
    };

    self.enter = function() {
        self.drawOverride = !self.drawOverride;
    };

    self.frame = function(t) {
        window.requestAnimationFrame(self.frame);

        self.dt += Math.min(5000, (t - self.gameFrame));

        if (self.dt / self.step >= 1) {
            let remainder = self.dt % self.step;
            let steps = self.dt / self.step;
            self.update(steps);
            self.draw();
            self.dt = remainder;
        }
        self.gameFrame = t;        
    };

    self.generateClouds = function(offset, leftpad, width, rightpad, skyheight) {
        for (let i = 0; i < CLOUD_ROWS; i++){
            for (let x = 0; x < CLOUD_COLUMNS; x++){
                let template = Object.assign({}, CLOUD_TEMPLATE[self.getRandom(0, 2)]);
                template.row = i;
                template.column = x;
                self.clouds.push(template);
            }
        }

        let xspan = leftpad + width + rightpad;
        let yspan = skyheight;
        let colspan = xspan / CLOUD_COLUMNS;
        let rowspan = yspan / CLOUD_ROWS;

        self.clouds = self.clouds.map(self.mapCloud(offset.x, colspan, offset.y, rowspan));
    };

    self.generateGrassBlade = function(x, y) {
        self.grassBlades.push({
            x: x,
            y: y
        });
    };

    self.generateGrassShadowBlade = function(adjustment, x, y) {
        self.shadowBlades.push({
            adjustment: adjustment,
            x: x,
            y: y
        });
    };

    self.generateGrassBlades = function(offset, leftpad, width, rightpad, height) {
        let xtotal = leftpad + width + rightpad;
        let ymin = 0;
        let iterations = height / (1.5 * GRASS_BLADE_HEIGHT);

        for (let i = 0; i < iterations; i++){
            let xmin = 0;
            let ybase = ymin + (i * 2 * GRASS_BLADE_HEIGHT);
            while (xmin < xtotal) {
                let yactual = ybase + self.getRandom(-(GRASS_BLADE_HEIGHT * .5), GRASS_BLADE_HEIGHT * 1.5);

                if (yactual < ymin) yactual = ymin;

                self.generateGrassBlade(xmin, yactual);

                if (self.getRandomBool(4)){
                    let shadowy = yactual - 1;
                    let adjustment = (ymin - shadowy);
                    if (adjustment > 0) shadowy -= adjustment;
                    else adjustment = 0;

                    self.generateGrassShadowBlade(adjustment, xmin + 1, shadowy);
                }

                xmin += self.getRandom(2, 4);
            }
        }
    };

    self.generatePauseButton = function() {
        self.drawImage(self.pauseContext, 'pauseButton');
    };

    self.generatePlayButton = function() {
        self.drawImage(self.playContext, 'playButton');
    };

    self.getCanvasPoint = function (e) {
        var rect = self.gameCanvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    self.getRandom = function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    self.getRandomBool = function(divisor) {
        let num = self.getRandom(1, divisor);
        return num === 1;
    };

    self.handleClick = function(e) {
        e = e || event; //IE compatibility
        e.preventDefault();

        var clickPosition = self.getCanvasPoint(e);

        if (self.isInCanvas(clickPosition)) self.clickObjects(clickPosition);     
    };

    self.handleJumpSteps = function(steps, y) {
        if (self.player.jumping) {
            if (steps > self.player.jumptime + self.player.hangtime + self.player.falltime) {
                self.player.jumping = false;
                self.player.jumptime = 0;
                self.player.hanging = false;
                self.player.hangtime = 0;
                self.player.falling = false;
                self.player.falltime = 0;
                y += (PLAYER_STARTING_Y - self.player.y);
            }

            else if (steps > self.player.jumptime + self.player.hangtime) {
                //jump up and hang are done by the time we re-render
                //allocate remainder to falling
                let diff = steps - (self.player.jumptime + self.player.hangtime);
                let jumpChange = PLAYER_JUMP_SPEED * self.player.jumptime;

                self.player.jumptime = 0;
                self.player.jumping = false;

                self.player.hangtime = 0;

                self.player.falltime -= diff;
                //console.log('Falltime left: ' + self.player.falltime);
                self.player.falling = self.player.falltime > 0;

                let fallChange = PLAYER_FALL_SPEED * diff;

                y += (jumpChange + fallChange);
            }

            else if (steps > self.player.jumptime) {
                //jump up is done by the time we re-render
                //so add those then hang
                let diff = steps - self.player.jumptime;
                let jumpChange = PLAYER_JUMP_SPEED * self.player.jumptime;

                self.player.jumptime = 0;
                self.player.jumping = false;

                self.player.hangtime -= diff;
                self.player.hanging = self.player.hangtime > 0;

                y += jumpChange;
            }

            else {
                self.player.jumptime -= steps;
                if (self.player.jumptime < 1) {
                    self.player.jumping = false;
                    self.player.jumptime = 0;
                    self.player.hanging = true;
                }

                y += (PLAYER_JUMP_SPEED * steps);
            }
        }

        else if (self.player.hanging) {  
            //jump is over, reset to ground level
            if (steps > self.player.hangtime + self.player.falltime) {
                self.player.jumping = false;
                self.player.jumptime = 0;
                self.player.hanging = false;
                self.player.hangtime = 0;
                self.player.falling = false;
                self.player.falltime = 0;
                y = PLAYER_STARTING_Y - self.player.y
            }

            //hang is over, start fall
            else if (steps > self.player.hangtime) {
                let diff = steps - self.player.hangtime;
                self.player.hanging = false;
                self.player.hangtime = 0;
                self.player.falltime -= diff;
                self.player.falling = self.player.falltime > 0;
                y = PLAYER_FALL_SPEED * diff;
            }

            //hang
            else self.player.hangtime -= steps;
        }

        else if (self.player.falling) {
            if (steps >= self.player.falltime) {
                y = PLAYER_FALL_SPEED * self.player.falltime;
                self.player.falling = false;
                self.player.falltime = 0;
            }

            else {
                self.player.falltime -= steps;
                y = PLAYER_FALL_SPEED * steps;
            }
        }

        return y;
    };

    self.handleKeys = function() {
        if (self.testKeys(KEY_ENTER)) self.enter();
        if (self.testKeys(KEY_SPACE)) self.space();
        if (self.testKeys(KEY_UP)) self.scrollUp();
        if (self.testKeys(KEY_DOWN)) self.scrollDown();
        if (self.testKeys(KEY_LEFT, KEY_RIGHT) || self.testKeysAnti(KEY_LEFT, KEY_RIGHT));
        else if (self.testKeys(KEY_LEFT)) self.scrollLeft();
        else if (self.testKeys(KEY_RIGHT)) self.scrollRight();

        self.keyMap = {};
    };

    self.handlePlayerMovement = function (steps) {
        let x = 0;
        let y = 0;

        y = self.handleJumpSteps(steps, y);
        x = self.handlePlayerMoveSteps(steps, x);
        

        if (x === 0 && y === 0) return;

        self.positionPlayer(x, y);
    };

    self.handlePlayerMoveSteps = function(steps, x) {
        if (self.player.movingLeft) {
            if (steps >= self.player.movetime) {
                x += PLAYER_MOVE_LEFT_SPEED * self.player.movetime;
                self.player.movingLeft = false;
                self.player.movetime = 0;
            }

            else {
                x += PLAYER_MOVE_LEFT_SPEED * steps;
                self.player.movetime -= steps;
            }
        }

        else if (self.player.movingRight) {
            if (steps >= self.player.movetime) {
                x += PLAYER_MOVE_RIGHT_SPEED * self.player.movetime;
                self.player.movingRight = false;
                self.player.movetime = 0;
            }

            else {
                x += PLAYER_MOVE_RIGHT_SPEED * steps;
                self.player.movetime -= steps;
            }
        }

        return x;
    };

    self.handleScreenMovement = function (steps) {
        let x = 0;
        let y = 0;

        x = self.handleScreenXSteps(steps, x);
        y = self.handleScreenYSteps(steps, y);

        if (x === 0 && y === 0) return;

        self.positionScreen(x, y);
    };

    self.handleScreenXSteps = function(steps, x) {
        if (self.screen.movingLeft) {
            if (steps >= self.screen.movetime) {
                x += (SCREEN_MOVE_LEFT_SPEED * self.screen.movetime);
                self.screen.movingLeft = false;
                self.screen.movetime = 0;
            }

            else {
                x += (SCREEN_MOVE_LEFT_SPEED * steps);
                self.screen.movetime -= steps;
            }
        }

        else if (self.screen.movingRight) {
            if (steps >= self.screen.movetime) {
                x += (SCREEN_MOVE_RIGHT_SPEED * self.screen.movetime);
                self.screen.movingRight = false;
                self.screen.movetime = 0;
            }

            else {
                x += (SCREEN_MOVE_RIGHT_SPEED * steps);
                self.screen.movetime -= steps;
            }
        }

        return x;
    };

    self.handleScreenYSteps = function(steps, y) {
        if (self.screen.movingUp) {
            if (steps >= self.screen.movetime) {
                y += (SCREEN_VERTICAL_MOVE_SPEED * self.screen.movetime);
                self.screen.movingUp = false;
                self.screen.movetime = 0;
            }

            else {
                y += (SCREEN_VERTICAL_MOVE_SPEED * steps);
                self.screen.movetime -= steps;
            }
        }

        else if (self.screen.movingDown) {
            if (steps >= self.screen.movetime) {
                y -= (SCREEN_VERTICAL_MOVE_SPEED * self.screen.movetime);
                self.screen.movingDown = false;
                self.screen.movetime = 0;
            }

            else {
                y -= (SCREEN_VERTICAL_MOVE_SPEED * steps);
                self.screen.movetime -= steps;
            }
        }

        return y;
    };

    self.isInBounds = function(mouse, object){
        //xmin,ymax xmax,ymin
        //left is offset from x = 0, top is offset from y = 0
        //so we need to record two points of left/top
        return mouse.x >= object.x.min && mouse.x <= object.x.max && mouse.y >= object.y.min && mouse.y <= object.y.max;
    };

    self.isInCanvas = function(point) {
        return self.isInBounds(point, SCREEN_BOUNDS);
    };

    //http://stackoverflow.com/a/12444641/1701316
    //handle multiple key input
    self.mapKey = function(e) {
        e = e || event; //IE compatibility
        e.preventDefault();

        if (self.paused) return;
        
        self.keyMap[e.keyCode] = e.type == 'keydown';
    };

    self.mapCloud = function(xOffset, colSpan, yOffset, rowSpan) {
        return function(cloud) {
            //column - cloud, divided in two (nearest lower integer)
            let sides = parseInt((colSpan - cloud.width) / 2);
            //wiggle
            let randVal = self.getRandom(4, 12);
            //randomly left or right
            randVal = self.randomBool() ? randVal : -randVal;
            //sum
            let cloudLeft = sides + randVal;
            
            //row - cloud, divided in two (nearest lower integer)
            let verts = parseInt((rowSpan - cloud.height) / 2);
            //wiggle
            let nextRand = self.getRandom(2, 5);
            //randomly up or down
            nextRand = self.randomBool() ? randVal : -randVal;
            //sum
            let cloudTop = verts + randVal;

            return {
                src: 'img/' + cloud.name,
                x: xOffset + (colSpan * cloud.column) + cloudLeft,
                y: yOffset + (rowSpan * cloud.row) + cloudTop
            }
        };
    };

    self.mergeSecondaries = function () {
        self.gameContext.drawImage(self.skyCanvas, self.screen.x, self.screen.y, SKY_WIDTH, SKY_HEIGHT);
        
        //cover part of the drawn sky
        self.gameContext.fillStyle = SKY_COLOR;
        //SCREEN_HEIGHT - GRASS_HEIGHT is the first pixel of the ground
        let overdrawHeight = (SCREEN_HEIGHT - (GRASS_HEIGHT + 1)) - (SKY_DRAW_HEIGHT);
        self.gameContext.fillRect(0, SKY_DRAW_HEIGHT + 1, SCREEN_WIDTH, overdrawHeight);

        self.gameContext.drawImage(self.menuCanvas, 0, 0);
        self.gameContext.drawImage(self.groundCanvas, self.screen.x, self.ground.y);
    };

    self.pauseGame = function() {
        self.paused = !self.paused;
        self.drawMenu();
    };

    self.playerCanMove = function() {
        return !self.player.movingLeft &&
               !self.player.movingRight &&
               !self.player.bouncingLeft &&
               !self.player.bouncingRight;
    };

    self.positionPlayer = function(xdiff, ydiff) {
        xdiff = self.checkPlayerXBound(xdiff);
        ydiff = self.checkPlayerYBound(ydiff);
        if (xdiff === 0 && ydiff === 0) return;

        self.player.move(xdiff, ydiff);
    };

    self.positionScreen = function(xdiff, ydiff) {
        xdiff = self.checkScreenXBound(xdiff);
        ydiff = self.checkScreenYBound(ydiff);
        if (xdiff === 0 && ydiff === 0) return;

        self.screen.move(xdiff, ydiff);
    };

    self.randomBool = function() {
        return self.getRandomBool(2);
    };

    self.screenCanMove = function() {
        return !self.screen.movingLeft &&
               !self.screen.movingRight;
    };

    self.scrollDown = function() {
        if (self.screen.canMove()) {
            if (!self.screen.bounded.down) {
                self.screen.moveDown();
            } 
        }

        else {
            console.log('Screen can\'t move down');

            if (self.screen.bounded.left) console.log('screen bounded left');
            if (self.screen.bounded.down) console.log('screen bounded down');
            if (self.screen.bounded.up) console.log('Screen bounded up');
            if (self.screen.bounded.right) console.log('Screen bounded right');
            if (self.screen.movingLeft) console.log('screen moving left');
            if (self.screen.movingDown) console.log('Screen moving down');
            if (self.screen.movingUp) console.log('Screen moving up');
            if (self.screen.movingRight) console.log('Screen moving right');
        }
    };

    self.scrollLeft = function() {
        if (self.playerCanMove()) {
            if (!self.player.isBoundedLeft()) self.player.moveLeft();
        }

        if (self.screenCanMove()){
            //if (self.player.isBoundedLeft()) self.screen.moveLeft();
            self.screen.moveLeft();
        }

        else {
            console.log('Screen can\'t move left');

            if (self.screen.bounded.left) console.log('screen bounded left');
            if (self.screen.bounded.down) console.log('screen bounded down');
            if (self.screen.bounded.up) console.log('Screen bounded up');
            if (self.screen.bounded.right) console.log('Screen bounded right');
            if (self.screen.movingLeft) console.log('screen moving left');
            if (self.screen.movingDown) console.log('Screen moving down');
            if (self.screen.movingUp) console.log('Screen moving up');
            if (self.screen.movingRight) console.log('Screen moving right');
        }
    };

    self.scrollRight = function() {
        if (self.playerCanMove()) {
            if (!self.player.isBoundedRight()) self.player.moveRight();
        }

        if (self.screenCanMove()) {
            //if (self.player.isBoundedRight()) self.screen.moveRight();
            if (!self.screen.bounded.right) self.screen.moveRight();
        }

        else {
            console.log('Screen can\'t move right');

            if (self.screen.bounded.left) console.log('screen bounded left');
            if (self.screen.bounded.down) console.log('screen bounded down');
            if (self.screen.bounded.up) console.log('Screen bounded up');
            if (self.screen.bounded.right) console.log('Screen bounded right');
            if (self.screen.movingLeft) console.log('screen moving left');
            if (self.screen.movingDown) console.log('Screen moving down');
            if (self.screen.movingUp) console.log('Screen moving up');
            if (self.screen.movingRight) console.log('Screen moving right');
        }
    };

    self.scrollUp = function() {
        if (self.screen.canMove()){
            if (!self.screen.bounded.up) self.screen.moveUp();
        }

        else {
            console.log('Screen can\'t move up');

            if (self.screen.bounded.left) console.log('screen bounded left');
            if (self.screen.bounded.down) console.log('screen bounded down');
            if (self.screen.bounded.up) console.log('Screen bounded up');
            if (self.screen.bounded.right) console.log('Screen bounded right');
            if (self.screen.movingLeft) console.log('screen moving left');
            if (self.screen.movingDown) console.log('Screen moving down');
            if (self.screen.movingUp) console.log('Screen moving up');
            if (self.screen.movingRight) console.log('Screen moving right');
        }
    };

    self.setBase = function() {
        self.gameContext.fillStyle = SKY_COLOR;
        self.gameContext.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    };

    self.space = function() {
        if (self.player.canJump()) self.player.jump();
    };

    self.startPlayerBounce = function(left, distance, duration) {
        let target = left ? self.player.bouncingLeft : self.player.bouncingRight;
        distance = left ? -distance : distance;
        self.player.bouncetime = duration;
        self.player.bouncespeed = distance;
    };

    self.testKeys = function() {
        return !Array.prototype.until.call(arguments, x => { return !self.keyMap[x] });
    };

    self.testKeysAnti = function() {
        let retVal = true;
        let i;
        let len = arguments.length;

        for (i = 0; i < len; i++){
            if (self.keyMap[arguments[i]]){
                retVal = false;
                break;
            }
        }
    };

    self.update = function(steps){
        self.handleKeys();

        self.handlePlayerMovement(steps);
        self.handleScreenMovement(steps);
    };

    //"constructor"
    self.activate = (function(){                
        self.generatePauseButton();
        self.generatePlayButton();

        self.bindEvents();
        
        self.generateClouds({x: 0, y: 0}, SCREEN_PADDING_LEFT, SCREEN_WIDTH, SCREEN_PADDING_RIGHT, SKY_HEIGHT);
        self.generateGrassBlades({x: 0, y: 0}, SCREEN_PADDING_LEFT, SCREEN_WIDTH, SCREEN_PADDING_RIGHT, GRASS_HEIGHT);

        self.setBase();
        self.drawSecondaries();        
        window.requestAnimationFrame(self.frame);
    })();
})();