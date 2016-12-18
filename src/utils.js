export const centerGameObjects = (objects) => {
    objects.forEach(function (object) {
        object.anchor.setTo(0.5)
    })
};

export const setResponsiveWidth = (sprite, percent, parent) => {
    let percentWidth = (sprite.texture.width - (parent.width / (100 / percent))) * 100 / sprite.texture.width;
    sprite.width = parent.width / (100 / percent);
    sprite.height = sprite.texture.height - (sprite.texture.height * percentWidth / 100)
};

export const checkOverlap = (sprite, boundsArray) => {
    let spriteBounds = sprite.getBounds();

    return boundsArray.some(function (bounds) {
        console.log("Checking bounds", spriteBounds, bounds);
        if (Phaser.Rectangle.intersects(spriteBounds, bounds)) {
            console.log("collide!");
            return true;
        }
    });
};


//find objects in a Tiled layer that contain a property called "type" equal to a certain value
export const findObjectsByType = (type, map, layer) => {
    let result = [];
    map.objects[layer].forEach(function (element) {
        if (element.type === type) {
            //Phaser uses top left, Tiled bottom left so we have to adjust
            //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
            //so they might not be placed in the exact position as in Tiled
            element.y -= map.tileHeight;
            result.push(element);
        }
    });
    return result;
};

export const findBoundingBoxesByType = (type, map, layer) => {
    let objects = findObjectsByType(type, map, layer);

    let result = [];
    objects.forEach(function (obj) {
        let rect = new Phaser.Rectangle(obj.x, obj.y, obj.width, obj.height);
        result.push(rect);
    });

    return result;
};