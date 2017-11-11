/**
 * Console Palette
 *  (c) 2017 Brendan Fuller
 *  - View Triggers
 *  - Message
 */
class ConsoleMain extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-console/console.shadow.html")
        this.loadContent("elements/rb-console/console.html")
    }
    onBoxLoad() {
        this.box = this.element.shadow.querySelector("rb-box")
    }
    onContentLoad() {
        let me = this
        this.area = this.element.querySelector("#console-area")
        //TESTING
        this.menu_item = new xel.MenuItem("#menu-item-newfile")
        this.menu_item.onClick(() => {
            dialogInput.open({
                title: "Console",
                place_holder: "Message"
              } , (self) => {
                    return {status: true}
              }, (self)=>{
                var data = self.input.value
                me.logMessage(data)
              })
        })
        this.area.addEventListener("contextmenu", () => {
            contextmenu.openTemp((temp, items) => {
                var new_sub = temp.addItemAbove("clear_console")
                new_sub.setTitle("Clear Console")
                new_sub.onClick(() =>  {
                    me.clearConsole()
                    temp.close()
                });
              })
        })
    }
    show() {
        this.box.style.height = "300px"
    }
    hide() {
        this.box.style.height = "84px"
    }
    /**
     * Logs a message to console usin custom codes
     *  - Font Size: ~20px~ <message>
     *  - Color: #FFFFFF <message>
     * @param {*} message
     */
    logMessage(message) {
        let output = message
        output = this.runPercentCmd(output)
        output = this.setColors(output)
        output = this.setSize(output)
        this.area.insertAdjacentHTML("afterbegin", `<span style="user-select: all !important">${output}</span>`)
    }
    runPercentCmd(data) {
        let output = ""
        let sizing = false
        let grabCmd = 0
        let cmd = ""
        let end = ""
        let ending = ""
        for (var i = 0; i < data.length; i++) {
            if (grabCmd) {
                if (data[i] == "%") {
                    grabCmd = false
                    if (cmd == "time") {
                        let n = new Date().toLocaleTimeString();
                        output = output + n
                    }
                    if (cmd == "unit") {
                       let me = this
                       this.callEvent("onLoad", [me])
                    }
                } else {
                    cmd = cmd + data[i]
                }
            } else {
                if (data[i] == "%") {
                    if (ending) {
                       output = output + end
                    }
                    grabCmd = true
                    cmd = ""
                } else {
                    output = output + data[i]
                }
            }
        }
        if (ending) {
            output = output + end
         }
        return output
    }
    setColors(data) {
        let output = ""
        let painting = false
        let grabColor = 0
        let color = ""
        for (var i = 0; i < data.length; i++){
            if (data[i] == "#") {
                if (painting) {
                   output = output + "</span>"
                }
                grabColor = true
                color = ""
            }
            if (grabColor) {
                color = color + data[i]
                if (color.length == 7) {
                    grabColor = false
                    painting == true
                    output = output + `<span style="color: ${color}">`
                }
            } else {
                output = output + data[i]
            }
        }
        if (painting) {
            output = output + "</span>"
        }
        return output
    }
    setSize(data) {
        let output = ""
        let sizing = false
        let grabSize = 0
        let size = ""
        for (var i = 0; i < data.length; i++) {
            if (grabSize) {
                if (data[i] == "~") {
                    grabSize = false
                    sizing = true
                    output = output + `<span style="font-size: ${size}">`
                } else {
                    size = size + data[i]
                }
            } else {
                if (data[i] == "~") {
                    if (sizing) {
                       output = output + "</span>"
                    }
                    grabSize = true
                    size = ""
                } else {
                    output = output + data[i]
                }
            }
        }
        if (sizing) {
            output = output + "</span>"
         }
        return output
    }
    clearConsole() {
        this.area.innerHTML = `            <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>
        <br style="user-select: none;"/>`
    }
    onUnitLoad(time) {
        time = time.toFixed(2)
        this.logMessage(`#DA560ARoboBlox Loaded in: ${time}ms`) 
    }
}
class View extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-console-view/console-view.shadow.html")
        this.loadContent("elements/rb-console-view/console-view.html")
        this.toggle = false
    }
    onContentLoad() {
        var me = this
        let run = () => {
            if (me.toggle) {
                me.show(true)
            } else {
                me.show(false)
            }
        }
        this.parent = document.querySelector("rb-console")
        this.menu_item = new xel.MenuItem("#menu-view-console")

        this.menu_item.onClick(() => {
            run()
        });
        this.element.addEventListener("click", run)
        this.menu_item.setIcon("check")
    }
    show(data) {
        if (data == false || data == "false") {
            this.w = true
            
            this.parent.object.hide()
            this.updateMenuItem(false)
            this.element.setAttribute("show", "false")
            this.toggle = true

            this.w = false
            this.callEvent("onConsoleResize", [false])
        } else {
            this.w = true

            this.parent.object.show()
            this.element.setAttribute("show", "true")
            this.updateMenuItem(true)
            this.toggle = false

            this.w = false
            this.callEvent("onConsoleResize", [true])
        }
    }
    updateMenuItem(data) {
        if (data) {
            this.menu_item.setIcon("check")
        } else {
            this.menu_item.setIcon("")
        }
    }
    onAttributeChange(name, oldValue, newValue) {
        if (name == "show" && !this.w) {
            this.show(newValue)
        }
    }
}
class Palette extends forklift.PaletteLoader {
    constructor(id) {
        super(id)
        this.addBox("CONSOLE", "rb-console", ConsoleMain)
        this.addBox("CONSOLE-VIEW", "rb-console-view", View)
    }
    
}
module.exports = Palette