//A test
let renderer, someText, font;

NovoFont.fromJson("fonts/repcomm.json", (f)=>{
    font = f;
    //Create a canvas renderer
    renderer = new NovoFontCanvasRenderer ();

    //Create a text snippet
    someText = new NovoFontText();

    //Set the data to display
    someText.text = "ABCDEFGHIJK";

    //Use a new font info (size of this snippet, font to use)
    someText.fontInfo = new NovoFontInfo();
    someText.fontInfo.size = 32;
    someText.fontInfo.spacing = 1;

    //Set the font info's font to the one we just loaded
    someText.fontInfo.font = font;

    renderer.setSize(512, 64);
    document.body.appendChild(renderer.canvas);

    renderer.texts.push(someText);
    console.log("Rendering because of init");
    renderer.render();
});

document.addEventListener("keydown", (evt)=>{
    let first, last;
    switch(evt.key) {
        case "ArrowRight":
        renderer.caretInfo.selection.min++;
        renderer.caretInfo.selection.max = renderer.caretInfo.selection.min;
        break;
        case "ArrowLeft":
        renderer.caretInfo.selection.min--;
        if (renderer.caretInfo.selection.min < 0) renderer.caretInfo.selection.min = 0;
        renderer.caretInfo.selection.max = renderer.caretInfo.selection.min;
        break;
        case "ArrowUp":
        someText.fontInfo.size+=1;
        break;
        case "ArrowDown":
        someText.fontInfo.size-=1;
        break;
        case "Backspace":
        first = someText.text.substring(0, renderer.caretInfo.selection.min-1);
        last = someText.text.substring(renderer.caretInfo.selection.min);
        someText.text = first + last;
        renderer.caretInfo.selection.min--;
        renderer.caretInfo.selection.max = renderer.caretInfo.selection.min;
        break;
        case "Shift":
        break;
        case "Control":
        break;
        case "PrintScreen":
        break;
        case "Delete":
        break;
        case "CapsLock":
        break;
        default:
        console.log(evt.key);
        first = someText.text.substring(0, renderer.caretInfo.selection.min);
        last = someText.text.substring(renderer.caretInfo.selection.min);
        someText.text = first + evt.key + last;
        renderer.caretInfo.selection.min++;
        renderer.caretInfo.selection.max = renderer.caretInfo.selection.min;
        break;
    }
    renderer.render();
});
