let spriteManager = {
    image: new Image(), // Поле для хранения изображений
    sprites: new Array(), // Поле для хранения спрайтов
    imgLoadCount: 0,
    imgLoaded: false, // Загружена ли пикча
    jsonLoaded: false, // загружен ли json
    namesById: ['aristocrat','door', 'fallen tree','grass','grass1','grass2','grass3','mask','record', 'rock', 'sushi', 'tree'],

    //Парсинг тайлсета на спрайты
    loadSprites: function (path){
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.onreadystatechange = async function (){
                if(request.readyState === 4 && request.status === 200){

                    spriteManager.jsonLoaded = true;
                    let pics = JSON.parse(request.responseText).tiles;
                    for(let sprite of pics){
                        await new Promise((resolve, reject)=>{
                            let img = new Image();
                            img.src = '../map/' + sprite.image;
                            img.onload = () => {
                                spriteManager.imgLoadCount++;
                                if(spriteManager.imgLoadCount === pics.length){
                                    spriteManager.imgLoaded = true;
                                }
                                let obj = {img: img,
                                    id: sprite.id,
                                    name: spriteManager.namesById[sprite.id - 21]};
                                spriteManager.sprites.push(obj);
                                resolve();
                            }
                        })
                        
                    }
                }
                resolve()
            }
            request.open('GET', path, true);
            request.send();
        })
        
    },

    doSomething(){
        if(!spriteManager.jsonLoaded || !spriteManager.imgLoaded){
            setTimeout(function (){spriteManager.doSomething();}, 100);
        } else {
            console.log('Все спрайты успешно загружены');
        }
    },
    
    //Рисует спрайт 
    drawSprite(ctx, name, x, y){
        if(!spriteManager.imgLoaded || !spriteManager.jsonLoaded){
            setTimeout(function(){
                spriteManager.drawSprite(ctx, name, x, y);
            }, 100)
        } else {
            let sprite = this.sprites.find(elem => elem.name === name);
            if(!mapManager.isVisible(x,y,32,32)){
                return;
            }
            if(!sprite){
                console.log('Спрайта с таким именем не сущесвтует', name);
                return;
            }
            x -= mapManager.view.x;
            y -= mapManager.view.y;
            ctx.drawImage(sprite.img, x, y);
        }
    }
}

// spriteManager.loadSprites("../map/set1.tsj");
// spriteManager.doSomething();

