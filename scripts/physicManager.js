let physicManager = {
    update: function (obj){
        
        if(obj.move_x === 0 && obj.move_y === 0) // Объект не движется
            return 'stop';
        
        let newX = obj.pos_x + Math.floor(obj.move_x * obj.speed * 32);
        let newY = obj.pos_y + Math.floor(obj.move_y * obj.speed * 32);
        

        let brs = [24,33,31];
        let ts = mapManager.getTilesetIdx(newX + obj.size_x / 2, newY + obj.size_y / 2);
        
        let e = this.entityAtXY(obj, newX, newY);
        if(e !== null && obj.onTouchEntity){ // Есть столкновение c объектом
            obj.onTouchEntity(e);
            
            if(e instanceof Bonus){ // Становимся на место съеденного ролла
                e = null;
            }
        }
        if((brs.includes(ts) || ts === null) && obj.onTouchMap){ // Есть столкновение с препятствием или с картой
            obj.onTouchMap(ts);
        }
        

        if(!brs.includes(ts) && e === null && ts !== null){ // Можно двигаться
            //Проверка ts нa undef чисто для себя
            obj.pos_x = newX;
            obj.pos_y = newY;
        } else {
            return 'break';
        }
        return 'move';
    },

    entityAtXY(obj, x, y){
        for(let i = 0; i < gameManager.entities.length; i++){
            let e = gameManager.entities[i];
            if(e.name !== obj.name){
                if(x === e.pos_x && y === e.pos_y){
                    return e;
                }
            }
        }
        return null;
    },

    
}