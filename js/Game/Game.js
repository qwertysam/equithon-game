var ingame = {
    preload: gamePreload,
    create: gameCreate,
    update: gameUpdate
}

var player;
var playerText;

var juicebox;

var map;
var layer1;

var rightKey;
var leftKey;
var jumpKey;
var jetpackKey;

var glucoseBar;
var glucoseTextPrefix = "Glucose Level (mg/dL): ";
var glucoseText;

var goose; 
var sky0;
var sky1;
var sky2;
var sky3;
var sky4;

var cameraOff = 0;

var DEBUG = true;

// Load resources
function gamePreload() {
    // Loading tilemaps
    //game.load.tilemap("start", "assets/start.json", null, Phaser.Tilemap.TILED_JSON)
    game.load.json("start", "assets/start.json");
    game.load.json("ruins", "assets/ruins.json");
    game.load.json("test1", "assets/test1.json");
    game.load.json("test2", "assets/test2.json");
    game.load.json("test3", "assets/test3.json");
    game.load.json("test4", "assets/test4.json");
    game.load.json("test5", "assets/test5.json");
    game.load.json("test6", "assets/test6.json");

    // Loading Images
    game.load.image("tiles", "assets/tiles.png");
    game.load.image("juicebox", "assets/juice.png"); //at
    game.load.image("healthbar", "assets/healthBar.png");
    game.load.image("arrow", "assets/arrow.png");
    game.load.image("goose", "assets/goosesprite.png");

    game.load.image("sky0", "assets/sky0.png");
    game.load.image("sky1", "assets/sky1.png");
    game.load.image("sky2", "assets/sky2.png");
    game.load.image("sky3", "assets/sky3.png");
    game.load.image("sky4", "assets/sky4.png");

    // 105 by 133 images, 2 frames
    game.load.spritesheet("player", "assets/player.png", 105, 133, 2);
    game.load.spritesheet("goose", "assets/goosesprite.png", 440, 580, 2); 

    /* // Spritesheet loading example
    this.load.spritesheet('dude',
    'src/games/firstgame/assets/dude.png',
    { frameWidth: 32, frameHeight: 48 }
    );
    */
}

// Create game objects
function gameCreate() {
    game.physics.startSystem(Phaser.Physics.ARCADE); // Initializes the physics engine
    game.physics.arcade.gravity.y = GRAVITY; // Uses imaginary units
    game.stage.backgroundColor = "#81DAEA"; // Colour hex code

    // good example of loading a player animation spritesheet
    // https://phaser.io/tutorials/making-your-first-phaser-3-game/part5

    const skyScale = HEIGHT / 220;

    sky0 = game.add.tileSprite(0, 0, WIDTH / skyScale, HEIGHT / skyScale, "sky0");
    sky0.scale.setTo(skyScale, skyScale);
    sky0.fixedToCamera = true;
    sky1 = game.add.tileSprite(0, 0, WIDTH / skyScale, HEIGHT / skyScale, "sky1");
    sky1.scale.setTo(skyScale, skyScale);
    sky1.fixedToCamera = true;
    sky2 = game.add.tileSprite(0, 0, WIDTH / skyScale, HEIGHT / skyScale, "sky2");
    sky2.scale.setTo(skyScale, skyScale);
    sky2.fixedToCamera = true;
    sky3 = game.add.tileSprite(0, 0, WIDTH / skyScale, HEIGHT / skyScale, "sky3");
    sky3.scale.setTo(skyScale, skyScale);
    sky3.fixedToCamera = true;
    sky4 = game.add.tileSprite(0, 0, WIDTH / skyScale, HEIGHT / skyScale, "sky4");
    sky4.scale.setTo(skyScale, skyScale);
    sky4.fixedToCamera = true;

    // binds the UP arrow key to the jump function
    jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    // jumpKey.onDown.add(jump, this);

    if (DEBUG) {
        jetpackKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    }

    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);

    map = game.add.tilemap(); // Creates a blank tilemap
    map.addTilesetImage("tiles");

    layer0 = map.create("layer2", WORLD_WIDTH, WORLD_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);

    layer1 = map.create("layer1", WORLD_WIDTH, WORLD_HEIGHT, BLOCK_WIDTH, BLOCK_HEIGHT);
    layer1.resizeWorld();
    game.physics.arcade.enable(layer1);

    map.setCollision(COLLISION_IDS, true, layer1);
    addMap("start");
    addMap("ruins");
    addMap("test1");
    addMap("test2");
    addMap("test3");
    addMap("test4");
    addMap("test5");
    addMap("test6");
    addMap("test4");
    addMap("test2");
    addMap("test2");
    addMap("test2");
    addMap("test2");
    addMap("ruins");
    addMap("ruins");
    addMap("ruins");
    
    spawnJuice();

    player = game.add.sprite(200, 40, "player");
    player.scale.setTo(PLAYER_SCALE, PLAYER_SCALE);
    game.physics.enable(player); // Gives player a physics body
    player.body.bounce.x = 0.05;
    //game.physics.arcade.enable(layers[3]); // Slightly bouncy off wall
    player.body.collideWorldBounds = true; // Collide with the
    player.animations.add('walk', [0, 1], 4, true);
    player.anchor.setTo(0.5, 0.5);

    glucoseBar = game.add.sprite(glucoseBarX, glucoseBarY, "healthbar");
    glucoseBar.fixedToCamera = true;
    glucoseBar.width = 700;
    glucoseBar.height = 20;

    arrow = game.add.sprite(400, 0, "arrow"); //pointer on health bar
    arrow.fixedToCamera = true;

    goose = game.add.sprite(WIDTH/2, 200, "goose"); 
    goose.scale.setTo(0.1, 0.1); 
    game.physics.enable(goose); 
    goose.body.allowGravity = false; 
    goose.body.immovable = true; 

    var textStyle = {
        'font': "16pt Comic Sans MS"
    }
    glucoseText = game.add.text(300, 0, glucoseTextPrefix, textStyle);
    glucoseText.fixedToCamera = true;

    arrow = game.add.sprite(400, 30, "arrow"); //pointer on health bar
    arrow.fixedToCamera = true;
    arrow.width = 20;
    arrow.height = 40;

    juicebox = game.add.sprite(500, 200, "juicebox"); //at help random spawning...
    juicebox.scale.setTo(0.5, 0.5);
    game.physics.enable(juicebox); //gives juicebox sprite a physics body at
    juicebox.body.allowGravity = false;
    juicebox.body.immovable = true;
    juicebox.body.debug = true;

    // TODO
    //game.camera.follow(player)

    // TODO use fixedToCamera for hud
    // player.fixedToCamera = true;

    // Moves the camera to the bottom of the world
    game.camera.y = 300;

    if (DEBUG) {
        playerText = game.add.text(player.x, player.y, "(" + player.x + ", " + player.y + ")", textStyle);
        alert("Debug mode on.");
    }

    console.log("Ready!");
}

function updatePlayerText() {
    newx = player.x;
    newy = player.y;
    playerText.setText("(" + newx + ", " + newy + ")");
    playerText.x = newx;
    playerText.y = newy;
}

//spawn juice boxes
function juiceRespawn() {
    juicebox.body.enable = false;
    juicebox.body.visible = false;
    //for (i=0; i<3; i++){
    let validSpawn = true;
    let newx, newy;
    do {
        validSpawn = true;
        newx = game.rnd.integerInRange(game.camera.x + WIDTH, game.camera.x + 2 * WIDTH);
        newy = game.rnd.integerInRange(0, HEIGHT);
        console.log("trying x: " + newx + " y: " + newy);
        juicebox.body.allowGravity = false;
        juicebox.body.immovable = true;
        this.game.physics.arcade.collide(juicebox, layer1, ()=>{
            console.log("invalid spot");
            validSpawn = false;
        });
    } while (!validSpawn);
    juicebox.x = newx;
    juicebox.y = newy;
    juicebox.body.enable = true;
    juicebox.body.visible = true;
    console.log("Spawned new juice at x: " + juicebox.x + " y: " + juicebox.y);
}

// Update game objects
function gameUpdate() {

    // Makes the camera move to the left when the player pushes the viewport forward
    cameraOff = Math.max(cameraOff + CAMERA_SPEED, player.x + 16 - (2 * WIDTH / 3));
    game.camera.x = cameraOff;

    updateControls();

    // TODO test this shit, it's messed
    // End game if player falls off screen
    if (player.x + 16 < game.camera.x) {
        endGame();
    }

    // check if touching ground and handle collisions
    this.game.physics.arcade.collide(player, layer1);
    if (player.body.onFloor()) {
        touchingGround = true;
    } else {
        touchingGround = false;
    }

    //at - if collision happens between player and juicebox
    this.game.physics.arcade.collide(player, juicebox, () => {
        changeBloodSugar(30);
    }); //check line 114

    if (juicebox.x < game.camera.x - 500) {
        juiceRespawn();
    }

    updateSugar()
    if (DEBUG) {
        updatePlayerText();
    }
    moveSky();
}

//fixing arrow motion
function endGame() {

}