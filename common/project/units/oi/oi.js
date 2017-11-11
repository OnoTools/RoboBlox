class DialogOI {
    constructor() {
        this.id = this._getID()
        let template = `<x-dialog id="dialog-oi-${this.id}" class="io-dialog" style="border-radius: 20px; height: 150px">
        <main>
            <x-label id="title"></x-label>
            <x-box style="margin-top: 5px;">
            <x-select id="subsystem" style="width: 50%">
                <x-menu>
                </x-menu>
            </x-select>
            <x-select id="command" style="width: 50%">
                <x-menu>
                </x-menu>
            </x-select>
            </x-box>
            <x-box style="margin-top: 10px;">
            <x-button id="ok" class="button">
                <x-label class="fg-green bold">OK</x-label>
            </x-button>
            <x-label id="feedback" style="margin-left: 10px;" class="bold size-20 rb-red"></x-label>
            </x-box>
        </main>
        </x-dialog>`
        document.querySelector("body").insertAdjacentHTML("beforeend", template)
        this.dialog = document.querySelector("body").querySelector(`#dialog-oi-${this.id}`)
        this.instance = new xel.Dialog(this.dialog)

        this.title = this.dialog.querySelector("#title")
        this.btnOk = this.dialog.querySelector("#ok")
        this.lblFeedback = this.dialog.querySelector("#feedback")

        this.selSubsystem = new xel.Select(this.dialog.querySelector("#subsystem"))
        this.selCommand = new xel.Select(this.dialog.querySelector("#command"))

        this.done = () => { }

        this.btnOk.addEventListener("click", () => {
            this._finished()
        })

        //When the subsytem select box is changed
        this.selSubsystem.onChange(() => {
            this.onUpdate() // Run the onUpdate function
        })
        // When the command select box is changed
        this.selCommand.onChange(() => {
            this.isValid()
        })
    }
    open(obj, done) {
        this.selCommand.removeAllItems()
        this.selSubsystem.removeAllItems()

        let me = this
        this.done = done
        this.title.innerHTML = obj.title

        if (obj.title == undefined) { obj["title"] = "" }
        if (obj.key == undefined) { obj["key"] = "" }
        if (obj.command == undefined) { obj["command"] = "" }
        if (obj.subsystem == undefined) { obj["subsystem"] = null }


        this.instance.open()
        // When subsystem is selected this will trigger
        this.onUpdate = () => {
            // Checks if the select box is on a vaild subsystem
            if (this.selSubsystem.value != "none" && this.selSubsystem.value != null) {
                var commands = forklift.App.getUnit("STRUCTURE").Class.handler.getCommands(this.selSubsystem.value)
                this.selCommand.removeAllItems()
                if (Object.keys(commands).length == 0) {
                    this.selCommand.addItem("none", "No Commmands", null, true)
                } else {
                    this.selCommand.addItem("none", "Select Command", null, true)
                }
                for (var cmd in commands) {
                    this.selCommand.addItem(cmd, commands[cmd].Name)
                }
                console.log("COMMAND: " + obj.command)
                // Check command (if its a vaild command)
                let pass = false
                for (var cmd in commands) {
                    if (cmd == obj.command) {
                        pass = true
                    }
                }
                if (obj.command != null && obj.command != "" && pass) {
                    this.selCommand.setSelected(obj.command)
                } else {
                    this.selCommand.setSelected("none")
                }
            } else {
                this.selCommand.removeAllItems()
                this.selCommand.addItem("none", "- - - - -", null, true)
            }
        }
        this.onUpdate()
        // Checks if the subsystem is vaild to be used. If so, then change status
        this.isValid = () => {
            if (this.selCommand.value != "none" && this.selCommand.value != undefined) {
                let s = forklift.App.getUnitInstance("OI").oiManager.checkCommand(this.selSubsystem.value, this.selCommand.value, obj.key)
                if (!s) {
                    this.lblFeedback.innerHTML = "Command already being used!"
                } else {
                    this.lblFeedback.innerHTML = ""
                }
                return s
            } else {
                return false
                this.lblFeedback.innerHTML = ""
            }
        }

        // Load all subsystems into the subsystem select box.
        var systems = forklift.App.getUnit("STRUCTURE").Class.handler.getSubsystems()

        this.lblFeedback.innerHTML = ""
        if (Object.keys(this.selSubsystem) == 0) { // Check if there is any subsystems
            this.selSubsystem.addItem("none", "No Subsytems", null, true) // If none, display a defualt message of NONE
        } else {
            this.selSubsystem.addItem("none", "Select Subsystem", null, true) // If 1 or more, display a defualt message
        }
        // Loop through all subsystems created
        for (var sub in systems) {
            this.selSubsystem.addItem(sub, systems[sub].Name) // Add subsystem to the select box
        }
        // Check if this button has already been saved
        if (obj.subsystem != null) {
            this.selSubsystem.setSelected(obj.subsystem)
            this.onUpdate()
        } else {
            this.selSubsystem.setSelected("none")
        }
        // Return data to DONE function
        var data = {}
        data.dialog = dialog
        data.subsystem = this.selSubsystem
        data.command = this.selCommand

        // When enter button is click, it will run the 'finish' function
        this._finished = () => {
            if (me.isValid()) {
                me.done(data)
                me.instance.close()
            }
        }
    }
    _isVaild() { }
    _onUpdate() { }
    _finished() { }
    _getID() {
        return ([1e7] + 1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }
}
/*----------------------------------------------------------------------------------------*/
class OperatorInterface {
    constructor(parent) {
        this.history = forklift.App.getUnitInstance("HISTORY").handler
        this.content = forklift.App.getPaletteInstance("MAIN").getBoxObject("CONTENTS")

        this.opened = false
        //Open section means is there anything on the screen? (not at the moment)
        this.loadLayouts()
        this.loadGamepads()

        this.dialogOI = new DialogOI()
    }
    /**
     * loadLayouts - This loads the layouts for the controller
     */
    loadLayouts() {
        if (!this.content.storage.isCell("OI:Layouts")) {
            this.layouts = this.content.storage.loadTemplate(`./templates/gamepadLayout.json`)
            this.content.storage.saveStorageCell("OI:GamepadMapping", this.gamepads)
        } else {
            this.layouts = this.content.storage.getStorageCell("OI:Layouts")
        }
    }
    loadGamepads() {
        this.totalGamepads = 0
        this.gamepads = {}
        //this.gamepads = this.content.storage.getStorageCell("OI:Gamepads")
        this.gamepadNodes = {}
    }
    /**
     * openSection - When the Unit section (html) needs to be loaded to the screen 
     */
    onSelection(section) {
        let me = this
        //TODO: FIX XEL TREE VIEW!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        this.oiTree = new xel.TreeView("#oi-tree", "oi-tree")

        this.main = this.oiTree.addNode("control")
        this.main.setIcon("videogame-asset")
        this.main.setTitle("Controller(s)")

        var oiAdd = section.querySelector("#oi-add")
        this.selLayouts = new xel.Select(section.querySelector("#layouts"))
        this.updateLayouts()

        oiAdd.addEventListener("click", () => {
            if (this.totalGamepads < 10) {
                this.totalGamepads++
                let id = this.totalGamepads
                if (this.totalGamepads < 10) { 
                    forklift.App.getUnitInstance("HISTORY").handler.addEvent((rID) => {
                        me.newGamepad(id)
                    }, (rID) => {
                        me.delGamepad(id)
                    }, "Add Controller")
                }
            }
        })
        for (let gamepad in this.gamepads) {
            if (this.totalGamepads < 10) {
                this.totalGamepads++
                let id = this.totalGamepads
                this.showGamepad(gamepad, id)
            }
        }

        this.gamePad = 0
        this.opened = true
    }
    /**
     * newGamepad - When GamePad button is click, it will create a new GamePad...
     * @param {*} id 
     */
    newGamepad(id) {
        this.showGamepad(null, id)
    }
    delGamepad(id) {
        console.log(id)
        delete this.gamepads[id]
        this.gamepadNodes[id].node.remove()
        delete this.gamepadNodes[id]
        if (this.totalGamepads != 0) {
            this.totalGamepads = this.totalGamepads - 1   
        }
    }

    /**
     * Shows a GamePad visually on the screen
     * @param {*} gamepad 
     */
    showGamepad(gamepad, id) {
        let me = this
        let layout = ""
        if (this.totalGamepads < 10) {
            if (gamepad == null) {
                let selectedLayout = this.selLayouts.value
                layout = this.layouts[selectedLayout]
                this.gamepads[id] = {}
                this.gamepads[id].buttons = {}
                this.gamepads[id].layout = selectedLayout
            }
            let defaultName = "Controller " + String(id) + ` {${layout.language.name[globalLanguage]}}`
            this.gamepadNodes[id] = {}
            this.gamepadNodes[id].node = this.main.addNode(id)
            this.gamepadNodes[id].node.setTitle(defaultName)
            this.gamepadNodes[id].buttons = {}


            let buttons = layout.buttons
            for (let key in buttons) {
                this.gamepads[id].buttons[key] = {}

                this.gamepadNodes[id].buttons[key] = {}
                this.gamepadNodes[id].buttons[key] = this.gamepadNodes[id].node.addNode(key)
                this.gamepadNodes[id].buttons[key].setTitle(layout.language[key][globalLanguage])
                this.gamepads[id].buttons[key].wP = {}
                this.gamepads[id].buttons[key].wR = {}
                this.gamepads[id].buttons[key].wH = {}

                //WhenPressed Key
                this.gamepadNodes[id].buttons[key].wP = this.gamepadNodes[id].buttons[key].addNode("wP_" + key)
                this.gamepadNodes[id].buttons[key].wP.setTitle("WHEN PRESSED")
                this.gamepadNodes[id].buttons[key].wP.onClick(() => {
                    this.dialogOI.open({
                        title: "Added COMMAND for WHEN PRESSED",
                        key: key,
                        command: me.gamepads[id].buttons[key].wP.command,
                        subsystem: me.gamepads[id].buttons[key].wP.subsystem
                    }, (self) => {
                        if (me.gamepads[id].buttons[key].wP.subsystem != self.subsystem.value && me.gamepads[id].buttons[key].wP.command != self.command.value) {
                            forklift.App.getUnitInstance("HISTORY").handler.addEvent((rID) => {
                                me.gamepads[id].buttons[key].wP.subsystem = self.subsystem.value
                                me.gamepads[id].buttons[key].wP.command = self.command.value
                                me.gamepadNodes[id].buttons[key].wP.setColor("lightgreen")
                            }, (rID) => {
                                me.gamepads[id].buttons[key].wP.subsystem = null
                                me.gamepads[id].buttons[key].wP.command = null
                                me.gamepadNodes[id].buttons[key].wP.removeColor()
                            }, "Added COMMAND for WHEN PRESSED")
                        }
                    })
                })
                this.gamepadNodes[id].buttons[key].wR = this.gamepadNodes[id].buttons[key].addNode("wR_" + key)
                this.gamepadNodes[id].buttons[key].wR.setTitle("WHEN RELEASED")
                this.gamepadNodes[id].buttons[key].wR.onClick(() => {
                    this.dialogOI.open({
                        title: "Add COMMAND for WHEN RELEASED",
                        key: key,
                        command: me.gamepads[id].buttons[key].wR.command,
                        subsystem: me.gamepads[id].buttons[key].wR.subsystem
                    }, (self) => {
                        if (me.gamepads[id].buttons[key].wR.subsystem != self.subsystem.value && me.gamepads[id].buttons[key].wR.command != self.command.value) {
                            forklift.App.getUnitInstance("HISTORY").handler.addEvent((rID) => {
                                me.gamepads[id].buttons[key].wR.subsystem = self.subsystem.value
                                me.gamepads[id].buttons[key].wR.command = self.command.value
                                me.gamepadNodes[id].buttons[key].wR.setColor("lightgreen")
                            }, (rID) => {
                                me.gamepads[id].buttons[key].wR.subsystem = null
                                me.gamepads[id].buttons[key].wR.command = null
                                me.gamepadNodes[id].buttons[key].wR.removeColor()
                            }, "Added COMMAND for WHEN RELEASED")
                        }
                    })
                })
                //While Held Key
                this.gamepadNodes[id].buttons[key].wH = this.gamepadNodes[id].buttons[key].addNode("wH_" + key)
                this.gamepadNodes[id].buttons[key].wH.setTitle("WHILE HELD")
                this.gamepadNodes[id].buttons[key].wH.onClick(() => {
                    this.dialogOI.open({
                        title: "Add COMMAND for WHILE HELD",
                        key: key,
                        command: me.gamepads[id].buttons[key].wH.command,
                        subsystem: me.gamepads[id].buttons[key].wH.subsystem
                    }, (self) => {
                        if (me.gamepads[id].buttons[key].wH.subsystem != self.subsystem.value && me.gamepads[id].buttons[key].wH.command != self.command.value) {
                            forklift.App.getUnitInstance("HISTORY").handler.addEvent((rID) => {
                                me.gamepads[id].buttons[key].wH.subsystem = self.subsystem.value
                                me.gamepads[id].buttons[key].wH.command = self.command.value
                                me.gamepadNodes[id].buttons[key].wH.setColor("lightgreen")
                            }, (rID) => {
                                me.gamepads[id].buttons[key].wH.subsystem = null
                                me.gamepads[id].buttons[key].wH.command = null
                                me.gamepadNodes[id].buttons[key].wH.removeColor()
                            }, "Added COMMAND for WHILE HELD")
                        }
                    })
                })
                this.gamepadNodes[id].buttons[key].close()
                this.gamepadNodes[id].node.close()
            }
        }

    }
    updateLayouts() {
        this.selLayouts.removeAllItems()
        for (let layouts in this.layouts) {
            if (this.layouts[layouts].default == true) {
                this.selLayouts.addItem(layouts, this.layouts[layouts].language.name[globalLanguage], null, true)
            } else {
                this.selLayouts.addItem(layouts, this.layouts[layouts].language.name[globalLanguage])
            }
        }
        this.selLayouts.addItem("custom", "Add Layout...")
    }
    deleteGamepad(id, rID) {

    }

    saveGamepads() {
        //retrun array of controllers and all if its data
    }
    checkCommand(sID, cID, compareKey) {
        var pass = true
        for (var gamepad in this.gamepads) {
            for (var key in this.gamepads[gamepad].buttons) {
                if (this.gamepads[gamepad].buttons[key].wP.subsystem == sID) {
                    if (this.gamepads[gamepad].buttons[key].wP.command == cID && key != compareKey) {
                        pass = false
                    }
                }
                if (this.gamepads[gamepad].buttons[key].wR.subsystem == sID) {
                    if (this.gamepads[gamepad].buttons[key].wR.command == cID && key != compareKey) {
                        pass = false
                    }
                }
                if (this.gamepads[gamepad].buttons[key].wH.subsystem == sID) {
                    if (this.gamepads[gamepad].buttons[key].wH.command == cID && key != compareKey) {
                        pass = false
                    }
                }
            }
        }
        return pass
    }




    deleteSubsystem(sID) { }
    deleteCommand(sID, cID) { }
    _getID() {
        return ([1e7] + 1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

}
class BuildController {
    constructor(section, id) {
        this.section = section
        this.id = id
    }

}

class Unit extends forklift.Unit {
    constructor(u) {
        super(u)
        //this.setType("SECTION")
        this.controller = {}
        this.opened = {}

    }
    onPreload() {
        this.unitHook("STRUCTURE")
        let me = this
        this.sidebar = forklift.App.getPaletteInstance("SIDEBAR").getBoxObject("SIDEBAR")
        this.console = forklift.App.getPaletteInstance("CONSOLE").getBoxObject("CONSOLE")
        this.content = forklift.App.getPaletteInstance("MAIN").getBoxObject("CONTENTS")

        this.oi = this.sidebar.node.robot.addNode("oi")
        this.oi.setIcon("videogame-asset")
        this.oi.setTitle("Operator Interface")
        this.oi.onClick(() => {
            me.content.openSection(this.getDirectory() + "oi.html", "OI", "OI", "Operator Interface", "videogame-asset")
        })
        this.oiManager = new OperatorInterface(this)
    }
    onContentLoad(id, section) {
        this.opened[id] = true
        if (id == "OI") {
            this.section = section
            this.oiManager.onSelection(section)
            this.onWindowResize()
        } else {
            //add contoller creator here
        }
    }
    onSelect(id) {
        this.oi.title_box.style.fontStyle = "italic";
        this.oi.title_box.style.color = "white";
    }
    onDeselect(id) {
        this.oi.title_box.style.fontStyle = "";
        this.oi.title_box.style.color = "";
    }
    onClose(id) {

    }
    onSave(id) {

    }
    isSaved(id) {
        return this.saved
    }
    onWindowResize() {
        for (let section in this.opened) {
            if (section == "OI") {
                let oi_sidebar = this.section.querySelector("#oi-sidebar")
                let height = document.documentElement.clientHeight - document.querySelector("rb-menubar").clientHeight - document.querySelector("rb-menutabs").clientHeight - document.querySelector("rb-console").clientHeight - 100
                oi_sidebar.style.height = height + "px"
            } else {
                console.log("Not OI")
            }
        }
    }
    onConsoleResize() {
        this.onWindowResize()
    }
    /* STRUCUTRE EVENTS */
    STRUCTURE_onSubsystemDelete(sID) {
        this.handler.deleteSubsystem(sID)
    }
    STRUCTURE_onCommandDelete(sID, cID) {
        this.handler.deleteSubsystem(sID, cID)
    }
}

module.exports = Unit