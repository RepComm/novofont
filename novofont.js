"use strict";

let elem = (id)=>document.getElementById(id);
let rect = (e)=>e.getBoundingClientRect();

class NovoFont {
    static fromJson (fname, callback) {
        fetch(fname).then((response)=>{
            response.json().then((json)=>{
                Object.setPrototypeOf(json, NovoFont.prototype);
                if (json.chars) {
                    let keys = Object.keys(json.chars);
                    let key;
                    for (let i=0; i<keys.length; i++) {
                        key = keys[i];
                        if (json.chars[key].path) {
                            json.chars[key].p2d = new Path2D(json.chars[key].path);
                        }
                    }
                }
                if (json.nochar.path) {
                    json.nochar.p2d = new Path2D(json.nochar.path);
                }
                NovoFont.loadedFonts[json.name] = json;
                callback(json);
            });
        });
    }
    constructor (name, desc, chars, widthmode) {
        this.name = name;
        this.desc = desc;
        this.chars = chars;
        this.widthmode = (widthmode|"monospace"); //monospace|dynamic
        NovoFont.loadedFonts[this.name] = this;
    }
}
NovoFont.loadedFonts = new Object();

class NovoFontText {
    constructor () {
        this.text = "";
        this.fontInfo = undefined;
    }
}

class NovoFontInfo {
    constructor () {
        this.size = 12;
        this.font = undefined;
        this.spacing = 2;
        this.color = "#ffffff";
        this.thickness = 2;
    }
}

class CaretInfo {
    constructor () {
        this.selection = {
            min:0,
            max:0
        };
    }
    /** Overwritable method for custom drawing of this caret (and selection)
     * the translation is automagically set by the renderer
     * @param {CanvasRenderingContext2D} ctx context to draw on
     * @param {NovoFontInfo} fontinfo because we need the context of the font to draw in
     */
    render (ctx, fontinfo) {
        ctx.moveTo(0,0);
        ctx.lineTo(0,1);
        //ctx.strokeRect(0,0,0.1,1);
    }
}

class NovoFontCanvasRenderer {
    constructor () {
        this.canvas = document.createElement("canvas");
        this.canvas.style.backgroundColor = "black";
        this.context = this.canvas.getContext("2d");

        this.usedPixelWidth = 0;

        this.texts = new Array();
        this.caretInfo = new CaretInfo();
        this.totalCharOffset = 0; //Render helper
    }
    setSize (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        //this.render();
    }
    render () {
        this.context.save();
        this.context.setTransform(1,0,0,1,0,0);
        // Will always clear the right space
        this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.context.restore();

        this.usedPixelWidth = 0;
        this.usedPixelHeight = 0;
        this.totalCharOffset = 0;
        for (let text of this.texts) {
            this.renderText(text);
            this.totalCharOffset+=text.text.length;
        }
    }
    renderText (text) {
        let char;
        let charRenderData;

        this.context.strokeStyle = text.fontInfo.color;
        this.context.lineWidth = text.fontInfo.thickness / text.fontInfo.size;
        this.context.lineCap = "round";

        this.context.save();
        this.context.scale(text.fontInfo.size, text.fontInfo.size);

        for (let i=0; i<text.text.length; i++) {
            if (i !== 0) { //Add spacing between chars if we're not talking about first or last chars
                this.usedPixelWidth += text.fontInfo.spacing;
            }

            char = text.text.charCodeAt(i);
            if (char === 10) {
                this.usedPixelWidth = - text.fontInfo.size;
                this.usedPixelHeight += text.fontInfo.size;
            }
            charRenderData = text.fontInfo.font.chars[char];
            if (!charRenderData) charRenderData = text.fontInfo.font.nochar;
            if (charRenderData) {
                this.context.save();
                this.context.translate(this.usedPixelWidth/text.fontInfo.size, this.usedPixelHeight/text.fontInfo.size);

                this.context.beginPath();
                if (this.caretInfo.selection.min === this.caretInfo.selection.max) {
                    if (this.caretInfo.selection.min === this.totalCharOffset+i) {
                        //Draw caret using its render function
                        this.caretInfo.render(this.context, text.fontInfo);
                    }
                } else {
                    //Draw highlight
                }
                if (charRenderData.path !== "none") {
                    if (charRenderData.p2d) {
                        this.context.stroke(charRenderData.p2d);//new Path2D(charRenderData.path));
                    } else {
                        console.log(text.text[i]);
                    }
                }
                this.context.stroke();
                this.usedPixelWidth += text.fontInfo.size;
                this.context.restore();
            } else {
                if (char !== 10) {
                    this.usedPixelWidth += text.fontInfo.size;
                } else {
                    console.log(this.usedPixelWidth);
                    this.usedPixelWidth = 0;
                }
            }
        }

        this.context.restore();
    }
}
