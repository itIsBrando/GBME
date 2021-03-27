

var Map = new function()
{
    const canvas = document.getElementById('canvas');
    const canvasDiv = document.getElementById('canvasDiv');
    const tileSize = 8;
    const context = canvas.getContext("2d");

    this.init = function()
    {
        this.selected = 1;
        this.isMouseDown = false;
        this.showBorder = true;
        this.tilesetLoaded = false;
    }
    
    this.newMap = function(w, h)
    {
        this.width = parseInt(w);
        this.height = parseInt(h);
        this.mapBuffer = new Array(this.width * this.height);
        this.mapBuffer.fill(0);
        // add 1 to allow for a one pixel border
        // this is the size of each tile in the canvas
        this.pixelWidth = w * tileSize;
        this.pixelHeight = h * tileSize;

        canvas.width = this.pixelWidth;
        canvas.height = this.pixelHeight;
        
        this.screen = context.getImageData(0, 0, this.pixelWidth, this.pixelHeight);

        for(let i = 0; i < this.pixelWidth * this.pixelHeight * 4; i++)
        {
            this.screen.data[i] = 0xF0;
        }

        this.blit();
        this.initMouse();
        this.drawBorders();
        this.drawMap();
    }

    
    /**
     * Sets whether or not the map should have borders on it
     * @param enabled true to have borders on, otherwise off
     */
    this.setBorderStyle = function(enabled)
    {
        if(this.showBorder == enabled)
            return;

        this.showBorder = enabled;

        this.drawMap();
    }

    /**
     * Redraws the map
     */
    this.drawMap = function()
    {
        if(!isTilesetLoaded)
            return;
        
        for(let y = 0; y < this.height; y++)
            for(let x = 0; x < this.width; x++)
                this.writeTileAt(x, y, this.mapBuffer[x + y * this.width], true);

    }


    /**
     * Writes a tile
     * @param {Number} tileNumber 
     * @param {MouseEvent} event 
     */
    this.writeTile = function(tileNumber, event)
    {
        if(!this.tilesetLoaded)
            return;

        const pixelSize = Map.getTilePixels();
        let mx = event.clientX, my = event.clientY + window.scrollY;
        let x = Math.floor(mx / pixelSize);
        let y = Math.floor(my / pixelSize)- 1;

        this.writeTileAt(x, y, tileNumber, false);
    }


    /**
     * Draws a tile at (x, y)
     * @param {Number} x row
     * @param {Number} y column
     * @param {Number} tileNumber tile
     * @param {Boolean} force whether to force redraw or not
     */
    this.writeTileAt = function(x, y, tileNumber, force)
    {
        let i = x + y * this.width;
        
        if(force || this.mapBuffer[i] != tileNumber)
        {
            const img = Tileset.getTile(tileNumber, tileNumber != Map.selected);
            context.putImageData(img, x * tileSize, y * tileSize);
            this.drawborderAt(x, y);
            this.mapBuffer[i] = tileNumber;
        }
    }


    this.initMouse = function()
    {
        const mouse = document.getElementById('mapMouse');

        canvas.onmousedown = mouse.onmousedown = function(event)
        {
            Map.isMouseDown = true;
            Map.writeTile(Map.selected, event);
        }
        
        canvas.onmouseup = mouse.onmouseup = function()
        {
            Map.isMouseDown = false;
        }

        canvasDiv.parentNode.onmousemove = function(event)
        {
            const rect = canvas.getBoundingClientRect();
            const pixelSize = Map.getTilePixels();
            
            mouse.style.width = pixelSize;
            mouse.style.height = mouse.style.width;
            
            let mx = event.clientX, my = event.clientY + window.scrollY;
            let x = Math.floor(mx / pixelSize) * pixelSize;
            let y = Math.floor(my / pixelSize-1) * pixelSize;
            mouse.style.left = x + rect.left;
            mouse.style.top  = y + rect.top;

            if(x > rect.width || y > rect.height)
                mouse.style.display = 'none';
            else
                mouse.style.display = 'block';

            if(Map.isMouseDown == true)
                Map.writeTile(Map.selected, event);
        };


        canvasDiv.onmouseleave = function(event)
        {
            const rect = canvasDiv.getBoundingClientRect();

            if(parseFloat(mouse.style.left) > rect.width || parseFloat(mouse.style.top) > rect.height)
                mouse.style.display = 'none';
            // else
            //     mouse.style.display = 'block';
        }

    }


    this.blit = function() {
        context.putImageData(this.screen, 0, 0);
    }


    /**
     * @returns {Number} the number of pixels that each tile is in the browser
     */
    this.getTilePixels = function() {
        return canvas.offsetWidth / this.width;
    }


    this.drawBorders = function()
    {
        if(this.showBorder == false)
            return;
        
        context.fillStyle = context.strokeStyle = "#000"

        for(let y = 1; y < this.height; y++)
        {
            context.fillRect(0, y * tileSize, this.pixelWidth, 1);
        }
        
        for(let x = 1; x < this.width; x++)
        {
            context.fillRect(x * tileSize, 0, 1, this.pixelHeight);
        }

    }

    this.drawborderAt = function(x, y)
    {
        if(this.showBorder)
        {
            context.fillRect(x * tileSize, y * tileSize, tileSize, 1);
            context.fillRect((x+1) * tileSize, y * tileSize, 1, tileSize);
            context.fillRect(x * tileSize, (y+1) * tileSize, tileSize, 1);
            context.fillRect(x * tileSize, y * tileSize, 1, tileSize);
        }

        context.stroke();
    }

    this.openSettings = function()
    {
        document.getElementById('settingsDiv').style.display = 'block';
    }

    this.openExportMap = function()
    {
        document.getElementById('mapExportDiv').style.display = 'block';
    }

    /**
     * Downloads a `.h` file
     * @param {String} fileName name of the file
     * @param {String} dataName name of the array in the header
     */
    this.requestHeaderDownload = function()
    {
        let fileName = document.getElementById('mapFileName').value;
        const dataName = document.getElementById('mapMapName').value;
        const a = document.getElementById('aref');
        
        if(fileName.endsWith(".c"))
            fileName = fileName.replace(".c", ".h");

        let headerName = fileName.substring(0,fileName.indexOf('.')).toUpperCase() + "_H";

        let txt = "#ifndef " + headerName + "\n#define " + headerName
        + "\n\nextern unsigned char " + dataName + "[];"
        + "\n\n#endif";
        
        a.setAttribute('download', fileName);
        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt));
        a.click();
    }
    
    /**
     * Exports a map as a C file
     */
    this.requestCDownload = function()
    {
        const fileName = document.getElementById('mapFileName').value;
        const dataName = document.getElementById('mapMapName').value;
        const tileOffset = parseInt(document.getElementById('mapTileOffset').value);
        const sizeVarName = dataName + "_SIZE";
        const a = document.getElementById('aref');

        if(fileName.indexOf(' ') > -1 || dataName.indexOf(' ') > -1)
        {
            alert("Spaces are not allowed in file name.");
            return;
        }

        for(let i = 0; i < this.mapBuffer.length; i++)
            this.mapBuffer[i] += tileOffset;

        a.setAttribute('download', fileName);

        let txt = "#define " + sizeVarName + " " + (this.mapBuffer.length)
         + "\n#define " + dataName + "_WIDTH " + (this.width)
         + "\n#define " + dataName + "_HEIGHT " + (this.height)
         + "\n\nunsigned char " 
         + dataName + "[" + sizeVarName + "] = "
         + JSON.stringify(this.mapBuffer).replace('[', '{').replace(']', '}')
         + ";";

        a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt));
        a.click();


        for(let i = 0; i < this.mapBuffer.length; i++)
            this.mapBuffer[i] -= tileOffset;

    }

    
    /**
     * Save a map file
     */
    this.requestMapDownload = function()
    {
        const filename = "map.txt";
        const a = document.getElementById('aref');

        const map = new MapSave(this.mapBuffer, this.width, this.height);
        map.includeTileset();

        let data = JSON.stringify(map);

        a.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
        a.setAttribute("download", filename);

        a.click();
    }


    this.loadMap = function(event)
    {
        var file = event.target.files[0];
        if(!file)
        return;
        
        let reader = new FileReader();
        
        reader.onload = function(e)
        {
            const contents = e.target.result;
            const map = JSON.parse(contents);
            if(map.tileset)
            {
                Tileset.init(map.tileset, 8);
                console.log("load tilemap");
                console.log(isTilesetLoaded);
            }
            
            Map.newMap(map.width, map.height);
            Map.mapBuffer = map.buffer;
            // try to draw if we loaded a map with a tileset
            if(map.tileset)
                waitTilRedraw();
        }
        
        reader.readAsText(file);
    }

}

function waitTilRedraw()
{
    if(!isTilesetLoaded)
    {
        setTimeout(waitTilRedraw, 400);
        return;
    }

    Map.drawMap();
}


class MapSave {
    constructor(data, width, height)
    {
        this.width  = width;
        this.height = height;
        this.buffer = data;
        this.tileset= null;
    }

    includeTileset()
    {
        this.tileset = Tileset.getCanvas().toDataURL("image/png").replace("image/png", "image/octet-stream");
    }
}