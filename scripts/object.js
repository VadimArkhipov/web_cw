class Entity{
    constructor() {
        this.pos_x = 0;
        this.pos_y = 0;
        this.size_x = 0;
        this.size_y = 0;
        this.name = null;
    }
}

class Player extends Entity{
    constructor() {
        super();
        this.speed = 1;
        this.move_x = 0;
        this.move_y = 0;
        this.lifetime = 100;
    }
    draw(ctx){
        spriteManager.drawSprite(ctx, 'aristocrat', this.pos_x, this.pos_y);
    }

    update(){
        if(this.lifetime <= 0) { // Игрок умер
            this.kill();
        }
        physicManager.update(this);
    }

    onTouchEntity(obj){
        if (obj.name.match(/bonus[\d*]/)){ // Столкновение с бонусом
            this.lifetime += 50;
            obj.kill(); // Бонус удаляется
            gameManager.score += 25;
            soundManager.playWorldSound('../sounds/eat.mp3', this.pos_x, this.pos_y);
        }

        if (obj.name.match(/enemy[\d*]/)){ // Столкновение с врагом
        }
        
    }

    kill(){
        gameManager.laterKill.push(this);
    }

    fire(){
        let t = new Tune();
        t.size_x = 32;
        t.size_y = 32;
        t.name = "tune" + (++gameManager.fireNum);
        t.move_x = this.move_x;
        t.move_y = this.move_y;

        switch (this.move_x + 2*this.move_y){
            case -1:
                t.pos_x = this.pos_x - t.size_x;
                t.pos_y = this.pos_y;
                break;
            case 1:
                t.pos_x = this.pos_x + this.size_x;
                t.pos_y = this.pos_y;
                break;
            case -2:
                t.pos_x = this.pos_x;
                t.pos_y = this.pos_y - t.size_y;
                break;
            case 2:
                t.pos_x = this.pos_x;
                t.pos_y = this.pos_y + this.size_y;
                break;
            default: return;
        }
        gameManager.entities.push(t);
    }
}

class Enemy extends Entity{
    constructor() {
        super();
        this.lifetime = 100;
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 1;
    }

    draw(ctx){
        spriteManager.drawSprite(ctx, 'mask', this.pos_x, this.pos_y);
    }

    update(){
        if(this.lifetime <= 0){ // Враг умер
            this.kill();
            return;
        }


        this.move_x = 0;
        this.move_y = 0;
        
        // Если игрок в зоне видимости врага, то враг начинает идти в его сторону
        let radius = ((gameManager.player.pos_x/32 - this.pos_x/32)**2 + (gameManager.player.pos_y/32 - this.pos_y/32)**2)**0.5;
        if(radius <= mapManager.mapSize.x){
            
            if(Math.abs(gameManager.player.pos_x - this.pos_x) > Math.abs(gameManager.player.pos_y - this.pos_y)){
                if(gameManager.player.pos_x > this.pos_x){
                    this.move_x = 1;
                } else if(gameManager.player.pos_x < this.pos_x){
                    this.move_x = -1;
                } else {
                    this.move_x = 0;
                }
            } else {
                if(gameManager.player.pos_y > this.pos_y){
                    this.move_y = 1;
                } else if((gameManager.player.pos_y < this.pos_y)){
                    this.move_y = -1;
                } else{
                    this.move_y = 0;
                }
            }
            
            
        } else {   // Если враг не видит игрока, то он просто шагает на рандомную клетку

            if (Math.floor(Math.random() * 2) === 0){
                if(Math.floor(Math.random() * 2) === 0) this.move_x = -1;
                else this.move_x = 1;
            } else {
                if(Math.floor(Math.random() * 2) === 0) this.move_y = 1;
                else this.move_y = -1;
            }
            
        }
        
        
        
        
        
        physicManager.update(this);
    }

    onTouchEntity(obj){
        if(obj.name === 'player'){ // враг наносит урон при касании игрока
            obj.lifetime = obj.lifetime >= 30? obj.lifetime - 30 : 0;
            soundManager.playWorldSound('../sounds/enemyBeatsPlayer.mp3', this.pos_x, this.pos_y);
        }

    }

    kill(){
        gameManager.laterKill.push(this);
        gameManager.enemiesKill++;
        gameManager.score += 50;
    }

    fire() {
    }
}

class Tune extends Entity{
    constructor() {
        super();
        this.move_x = 0;
        this.move_y = 0;
        this.speed = 1;
    }

    draw(ctx){
        spriteManager.drawSprite(ctx, 'record', this.pos_x, this.pos_y);
    }

    update(){
        physicManager.update(this);
    }

    onTouchEntity(obj){
        if (obj.name.match(/enemy[\d*]/)){ // столкновение с врагом
            obj.lifetime -= 35;
        }
        if(!obj.name.match(/bonus[\d*]/) && !obj.name.match(/tune[\d*]/))
            this.kill();

        // if(obj.name.match(/tune[\d*]/))
        //     this.kill();
    }

    onTouchMap(idx){
        this.kill();
    }

    kill(){
        gameManager.laterKill.push(this);
        soundManager.playWorldSound('../sounds/brokenTune.mp3', this.pos_x, this.pos_y); // Звук
    }
}

class Bonus extends Entity{
    draw(ctx){
        spriteManager.drawSprite(ctx, 'sushi', this.pos_x, this.pos_y);
    }

    kill(){
        gameManager.laterKill.push(this);
        
    }

    update(){
        
    }
}



