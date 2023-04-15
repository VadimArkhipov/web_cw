let mapManager = {
    tSet: null, // тайлсэт
    lastLayerData: null, //Последний слой
    mapData: null, // здесь будет лежать карта
    tLayer: null, // здесь будут лежать слои
    xCount: 0, // ширина в блоках
    yCount: 0, // высота в блоках
    tSize: {x: 32, y: 32}, // размер блока
    mapSize: {x: 20, y: 20}, // размер карты в блоках
    tilesets: new Array(), // описание каждого блока карты
    imgLoadCount: 0, // Число загруженных изображений
    imgLoaded: false, // все изображения загружены
    jsonLoaded: false, // json описание загружено
    view: {
        x:0,
        y: 0,
        w: 640,
        h: 640,
    },
    pics: [],
    
    reset(){
        this.tSet = null;
        this.lastLayerData = null;
        this.mapData = null;
        this.tLayer = null;
        this.tilesets = new Array();
        this.imgLoadCount = 0;
        this.imgLoaded = false;
        this.jsonLoaded = false;
        
    },
    
    loadMap: function (path){
        return new Promise((resolve, reject)=>{
            let request = new XMLHttpRequest();
            request.onreadystatechange = async function(){
                if(request.readyState === 4 && request.status === 200){
                    await mapManager.parseMap(request.responseText);
                    resolve();
                }
            }
            request.open('GET', path, true);
            request.send(); 
        })
        
    },
    
    draw: function (){
        if(!mapManager.imgLoaded || !mapManager.jsonLoaded){
            setTimeout(function (){
                mapManager.draw(ctx);
            }, 100);
        } else {
            if (this.tLayer === null) {
                for (let id = 0; id < this.mapData.layers.length; id++) {
                    let layer = this.mapData.layers[id];
                    if (layer.type === 'tilelayer') {
                        this.tLayer = layer;
                    }

                    for (let i = 0; i < this.tLayer.data.length; i++) {
                        if (this.tLayer.data[i] !== 0) {
                            let tile = this.getTile(this.tLayer.data[i]);
                            let pX = (i % this.xCount) * this.tSize.x;
                            let pY = Math.floor(i / this.xCount) * this.tSize.y;

                            if (!this.isVisible(pX, pY, this.tSize.x, this.tSize.y)) {
                                continue;
                            }
                            pX -= this.view.x;
                            pY -= this.view.y;
                            ctx.drawImage(this.pics.filter(el => el.id === tile.index-1)[0].img, pX, pY);
                        }
                    }
                }
                this.tLayer = null;
            }
            
        }
    },
    
    parseMap: function(tilesJSON){
        return new Promise( (resolve, reject) => {
            this.mapData = JSON.parse(tilesJSON);
            this.xCount = this.mapData.width;
            this.yCount = this.mapData.height;
            this.tSize.x = this.mapData.tilewidth;
            this.tSize.y = this.mapData.tileheight;
            this.mapSize.x = this.xCount * this.tSize.x;
            this.mapSize.y = this.yCount * this.tSize.y;

            this.lastLayerData = this.mapData.layers[this.mapData.layers.filter(elem => elem.type === 'tilelayer').length - 1];
            

            for(let i = 0; i < this.mapData.tilesets.length; i++){
                imgSrc = "../map/" + (this.mapData.tilesets[i].source);
                //img.src = "../map/assets/ghost.png";

                // Загрузка всех ассетов
                let request = new XMLHttpRequest();
                request.onreadystatechange = async function(){
                    if(request.readyState === 4 && request.status === 200){
                        mapManager.tSet = JSON.parse(request.responseText).tiles;
                        for(let pic of mapManager.tSet){
                            await new Promise( (resolve, reject)=>{
                                let img = new Image();
                                img.src = '../map/' + pic.image;
                                img.onload = ()=>{
                                    mapManager.imgLoadCount++;
                                    if(mapManager.imgLoadCount === mapManager.tSet.length){
                                        mapManager.imgLoaded = true;
                                    }
                                    let obj = {img: img,
                                        id: pic.id};
                                    mapManager.pics.push(obj);
                                    resolve();
                                }  
                            })
                            
                        }
                    }
                    resolve();
                }
                request.open('GET', imgSrc, true);
                request.send();
                //

                let t = this.mapData.tilesets[i];

                let ts = {
                    firstgid: t.firstgid,
                    imageSource: imgSrc,
                    name: t.name,
                    xCount: Math.floor(32 / mapManager.tSize.x),
                    yCount: Math.floor(32 / mapManager.tSize.y),
                }
                this.tilesets.push(ts);

            }
            this.jsonLoaded = true;
        })
        
        },
    
    getTile: function (tileIndex){
            let tile = {
            img: null,
            px: 0,
            py: 0,
            index: tileIndex,
        };

        let tileset = this.getTileset(tileIndex);
        
        
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id / tileset.xCount);
        tile.px = x * mapManager.tSize.x;
        tile.py = y * mapManager.tSize.y;
        return tile;

        
    },
    
    getTileset: function (tileIndex){
        for(let i = this.tilesets.length - 1; i<= 0; i--){
            if(this.tilesets[i].firstgid <= tileIndex){
                return mapManager.tilesets[i];
            }
        }
        return null;
    },
    
    isVisible: function(x, y, width, height){
        if(x + width <= this.view.x || y + height <= this.view.y ||
            x >= this.view.x + this.view.w ||
            y >= this.view.y + this.view.h){
            return false;
        }
        return true;
    },
    
    parseEntities(){
        if(!mapManager.imgLoaded || !mapManager.jsonLoaded){
            setTimeout(function (){mapManager.parseEntities();}, 100);
        } else {
            for(let j = 0; j < this.mapData.layers.length; j++){
                if(this.mapData.layers[j].type === 'objectgroup'){
                    let entities = this.mapData.layers[j];
                    
                    
                    for(let i = 0; i < entities.objects.length; i++){
                        let e = entities.objects[i];
                        try{
                            // Нужно получить тип
                            let type = mapManager.tSet.find(obj => obj.id === e.gid - 1).properties.find(elem => elem.name === 'type').value;
                            let obj =new gameManager.factory[type]();
                            obj.name = gameManager.counter[type.toLowerCase()] >= 0 ? type.toLowerCase() + `${++gameManager.counter[type.toLowerCase()]}` : type.toLowerCase();
                            obj.pos_x = e.x;
                            obj.pos_y = e.y - 32;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            obj.properties = mapManager.tSet.find(obj => obj.id === e.gid - 1).properties;
                            gameManager.entities.push(obj);
                            if(obj.name === 'player'){
                                gameManager.initPlayer(obj);
                            }
                        } catch(ex) {
                            console.log('Error while creating: [' + e.gid + '] ' + e.type + ', ' + ex);
                        }
                    }
                }
            }
        }
    },
    
    getTilesetIdx(x, y){
        
        if(x > this.mapSize.x || y > this.mapSize.y){
            return null;
        }
        if( x < 0 || y < 0){
            return null;
        }
        let wX = x;
        let wY = y;
        let idx = Math.floor(wY / mapManager.tSize.y) * mapManager.xCount + Math.floor(wX / mapManager.tSize.x);
        //возвращает номер тайла в тайлсете (для дерева вернет 14)
        
        return mapManager.lastLayerData.data[idx];
        
    },
    
    centerAt(x, y){
        if(x < this.view.w/2){
            this.view.x = 0;
        } else if(x > this.mapSize.x * this.tSize.x - this.view.w/2){
            this.view.x = this.mapSize.x * this.tSize.x - this.view.w;
        } else {
            this.view.x = (x - (this.view.w/2));
        }
        if(y < this.view.h/2){
            this.view.y = 0;
        } else if(y > this.mapSize.y * this.tSize.y - this.view.h/2){
            this.view.y = (this.mapSize.y * this.tSize.y - this.view.h);
        } else {
            this.view.y = (y - (this.view.h/2));
        }
        
    }
}





