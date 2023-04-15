let gameManager = {
    start: true, // Флаг конца игры
    score: 0, // Текущий счет
    level: 1, // Текущий уровень
    enemiesUpdateCount: 0, // Враги в 10 раз медленнее, чем игрок
    keepGoing: null, // Указатель на обновление, чтобы прервать игру, когда игрок умрет
    factory: {}, //Здесь хранятся эталонные объекты
    entities: [], //массив объектов на карте. Здесь лежат все неубитые сущности
    fireNum: 0, // id выстрела
    player: null, //указатель на игрока
    laterKill: [], //добавленный сюда объект будет уничтожен
    
    levels: {1: '../map/map.tmj',
            2: '../map/map1.tmj'}, // Здесь лежат карты для уровней
    
    counter:{enemy: 0, bonus: 0}, // Созданных объектов
    enemiesKill : 0, // Счетчик убитых врагов

    initPlayer(obj){
        this.player = obj;
    },

    kill(obj){
        this.laterKill.push(obj);
    },

    update(){
        if(this.player === null){
            return;
        }
        
        if (this.player.lifetime <= 0){ // Главный герой умер -- игра окончена
            clearInterval(this.keepGoing);
            this.writeScore();
            window.location.href = 'lose.html';
        }
        

        if(mapManager.getTilesetIdx(gameManager.player.pos_x, gameManager.player.pos_y) === 23){ // Переход на следующий уровень
            let livingEnemies = this.entities.filter(entity => entity instanceof Enemy).length;
            if(livingEnemies === 0){
                this.level++;
                this.newLevel(); 
            }
        }


        this.player.move_x = 0;
        this.player.move_y = 0;
        // Простые движения
        if(eventsManager.action['up']) this.player.move_y = -1;
        if(eventsManager.action['down']) this.player.move_y = 1;
        if(eventsManager.action['left']) this.player.move_x = -1;
        if(eventsManager.action['right']) this.player.move_x = 1;
        //Время пострелять
        if(eventsManager.action['fire']) this.player.fire();

        this.entities.forEach(function(e){
            try{
                if(!e.name.match(/enemy[\d*]/) || (e.name.match(/enemy[\d*]/) && gameManager.enemiesUpdateCount % 10 === 0)) e.update();
                
                //Быстрая смерть врагов
                if(e.name.match(/enemy[\d*]/) && gameManager.enemiesUpdateCount % 10 !== 0 && e.lifetime <= 0){
                    e.update();
                }
                
            } catch (ex){
                console.log(e, ex);
            }
        });

        for(let i = 0; i < this.laterKill.length; i++){
            let idx = this.entities.indexOf(this.laterKill[i]);
            if(idx > -1){
                this.entities.splice(idx, 1);
            }
        }
        if(this.laterKill.length > 0){
            this.laterKill.length = 0;
        }
        
        ctx.clearRect(0,0,640,640);
        mapManager.draw(ctx);
        this.draw(ctx);
        //mapManager.centerAt(this.player.pos_x, this.player.pos_y);
        this.enemiesUpdateCount++;

        ctxState.clearRect(0,0,600,500);
        ctxState.fillText(`Здоровье: ${gameManager.player.lifetime}`, 0,0);
        ctxState.fillText(`Счёт: ${gameManager.score}`, 0,50);

    },
    
    draw(ctx){
        for (let e = 0; e < this.entities.length; e++){
            this.entities[e].draw(ctx);
        }
    },

    async loadAll(){
        await mapManager.loadMap(gameManager.levels[this.level]);
        await spriteManager.loadSprites('../map/set1.tsj');
        
        gameManager.factory['Player'] = Player;
        gameManager.factory['Enemy'] = Enemy;
        gameManager.factory['Tune'] = Tune;
        gameManager.factory['Bonus'] = Bonus;

        mapManager.parseEntities();
        mapManager.draw(ctx);
        eventsManager.setup(canvas);
    },

    play(){
        this.keepGoing = setInterval(updateWorld, 200);
        //setInterval(updateEnemies, 1000);
    },
    
    
    // Переход на новый уровень
    async newLevel() {
        clearInterval(this.keepGoing); // Остановка старого уровня

        this.fireNum = 0;
        this.enemiesKill = 0;
        this.counter.enemy = 0;
        this.counter.bonus = 0;

        this.entities.forEach(function (e) {
            e.kill();
        });
        
        if (this.level > 2){
            soundManager.play('../sounds/youWon.mp3'); // Звук
            clearInterval(this.keepGoing);
            //setTimeout(()=>{window.location.href = 'won.html';}, 5000);
            this.writeScore();
            window.location.href = 'won.html';

            return;
        } else {
            soundManager.play('../sounds/nextLevel.mp3'); // Звук

        }
        
        
        mapManager.reset();
        await gameManager.loadAll();
        this.play();
        

    },

    writeScore(){
        let note = JSON.parse(localStorage.getItem(localStorage.length - 1));
        note.score = this.score;
        localStorage.removeItem((localStorage.length - 1).toString());
        localStorage.setItem(localStorage.length, JSON.stringify(note));
    }

}

function updateWorld(){
    gameManager.update();
}

function updateEnemies(){
    gameManager.updateEnemies();
}