var Tileset = new function()
{
    const canvas = document.getElementById('tileCanvas');
    const context = canvas.getContext("2d");

    /**
     * Loads the tileset
     * @param {String} img base64 image referring to the tileset
     * @param {Number} tileSize pixel size of each tile in the table
     */
    this.init = function(img, tileSize)
    {
        const image = new Image();
        image.src = img;

        this.previewCanvas = document.getElementById('previewTile');

        if(image.width % tileSize != 0 || image.height % tileSize != 0)
        {
            console.log("IMAGE SIZE DOES NOT WORK");
        }

        image.onload = function() {
            console.log(image.width);
            Tileset.tileRows   = Math.floor(image.width / tileSize);
            Tileset.tileColumns= Math.floor(image.height / tileSize);
            Tileset.tileSize = tileSize;

            canvas.width = Tileset.tileRows * tileSize;
            canvas.height = Tileset.tileColumns * tileSize;
            context.drawImage(image, 0, 0);
            
            Tileset.updateActiveTile();
        };

        this.previewCanvas.width = tileSize;
        this.previewCanvas.style.minWidth = tileSize * 3;
        this.previewCanvas.height = tileSize;

        this.mouseInit();
        Map.tilesetLoaded = true;
    }
    

    this.updateActiveTile = function()
    {
        this.cachedTile = this.getTile(Map.selected, true)
        this.previewCanvas.getContext("2d").putImageData(this.cachedTile, 0, 0);
    }
    

    this.getTile = function(tileNumber, forceRefresh)
    {
        if(forceRefresh)
        {
            let tx = tileNumber % this.tileRows;
            let ty = Math.floor(tileNumber / this.tileRows);
            return context.getImageData(tx * this.tileSize, ty * this.tileSize, this.tileSize, this.tileSize);
        } else {
            return this.cachedTile
        }
    }


    this.getTilePixelsX = function() {
        return canvas.offsetWidth / this.tileRows;
    }

    this.getTilePixelsY = function() {
        return canvas.offsetHeight / this.tileColumns;
    }


    this.mouseInit = function()
    {
        const mouse = document.getElementById('tileMouse');
        const div = document.getElementById('mainTileDiv');
        
        div.onmousedown = function(event)
        {
            const rect = canvas.getBoundingClientRect();
            const pixelSizeX = Tileset.getTilePixelsX();
            const pixelSizeY = Tileset.getTilePixelsY();
            
            mouse.style.height = pixelSizeY;
            mouse.style.width = pixelSizeX;
            
            let mx = event.clientX, my = event.clientY + window.scrollY;

            let cx = Math.floor(mx / pixelSizeX);
            let cy = Math.floor(my / pixelSizeY);
            let x = cx * pixelSizeX;
            let y = cy * pixelSizeY;
            mouse.style.left = x;
            mouse.style.top  = y;

            cx -= Math.floor(rect.left / pixelSizeX)+1;
            cy -= Math.floor((rect.top + window.scrollY) / pixelSizeY-0.5)+1;
            Map.selected = cx + cy * Tileset.tileRows;
            Tileset.updateActiveTile();
        }
        
    }
}