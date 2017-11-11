class StructureHandler {
    constructor(p) {
        this.parent = p
        this.subsystems = {}
    }
    newSubsystem(name) {
        let me = this
        let sID = this._getID()
        let node = this.parent.subsystem.addNode(sID)
        this.subsystems[sID] = {}
        this.subsystems[sID].Node = node
        this.subsystems[sID].Name = name
        this.subsystems[sID].commands = {}

        this.subsystems[sID].Node.setTitle(name)
        this.subsystems[sID].Node.setIcon("grid-on")
        this.subsystems[sID].Node.onContextMenu(() => {
            contextmenu.openTemp((temp, items) => {
                temp.addSepAbove()
                let del = temp.addItemAbove("delete")
                del.setTitle("Delete")
                del.setIcon("delete")
                del.onClick(() => {
                    prompt.show("Do you want to delete this subsystem?", (response) => {
                        if (response == true) {
                            me.deleteSubsystem(sID)
                            me.parent.callEvent("onSubsystemDelete", [sID])
                        }
                    })
                })
                let rn = temp.addItemAbove("rename")
                rn.setTitle("Rename")
                rn.setIcon("create")
                rn.onClick(() => {
                    dialogInput.open({
                        title: "Rename Subsystem",
                        place_holder: "Subsystem Name",
                        max_length: 15,
                        min_length: 3,
                        value: me.subsystems[sID].Name,
                    }, (self) => {
                        if (!me.vaildSubsystemByName(self.input.value)) {
                            return { status: true }
                        }
                        return { status: false, hint: "Name already used." }
                    }, (self) => {
                        let name = self.input.value
                        me.renameSubsystem(sID, name) //Changes new id

                    })
                })
                temp.addSepAbove()
                let cmd = temp.addItemAbove("command")
                cmd.setTitle("New Command")
                cmd.setIcon("whatshot")
                cmd.onClick(() => {
                    dialogInput.open({
                        title: "New Command",
                        place_holder: "Command Name",
                        max_length: 15,
                        min_length: 3,
                    }, (self) => {

                        if (!me.vaildSubsystemByName(sID, self.input.value)) {
                            return { status: true }
                        }
                        return { status: false, hint: "Name already used." }
                    }, (self) => {
                        let name = self.input.value
                        me.newCommand(sID, name)
                    })
                })
                temp.addSepAbove()
                var ceditor = temp.addItemAbove("ceditor")
                ceditor.setTitle("Code Editor")
                ceditor.setIcon("code")
                ceditor.onClick(() => {
                    console.log("THE iyuldksjklfhdbhifsdjhfgsdfuhbikjgnbjhgbdfgsdjd  " + sID)
                    me.parent.content.openSection((me.parent.getDirectory() + "subsystemCode.html"), "STRUCTURE", `${sID}`, `${me.subsystems[sID].Name} Subystem`)
                })
            })
        })
        this.parent.subsystem.sortList()
        return node
    }
    newCommand(sID, name) {
        if (this.vaildSubsystemByID(sID)) {
            let me = this
            let cID = this._getID()

            let node = this.subsystems[sID].Node.addNode(cID)
            this.subsystems[sID].commands[cID] = {}
            this.subsystems[sID].commands[cID].Node = node
            this.subsystems[sID].commands[cID].Name = name

            this.subsystems[sID].commands[cID].Node.setTitle(name)
            this.subsystems[sID].commands[cID].Node.setIcon("whatshot")
            this.subsystems[sID].commands[cID].Node.onContextMenu(() => {
                contextmenu.openTemp((temp, items) => {
                    temp.addSepAbove()
                    let del = temp.addItemAbove("delete")
                    del.setTitle("Delete")
                    del.setIcon("delete")
                    del.onClick(() => {
                        let buttons = ['Yes', 'No', 'Cancel']
                        prompt.show('Do you want to delete this Command?', (response) => {
                            if (response == true) {
                                me.deleteCommand(sID, cID)
                                me.parent.callEvent("onCommandDelete", [sID, cID])
                            }
                        })
                    })

                    let rn = temp.addItemAbove("rename")
                    rn.setTitle("Rename")
                    rn.setIcon("create")
                    rn.onClick(() => {
                        dialogInput.open({
                            title: "Rename Command",
                            place_holder: "Command Name",
                            max_length: 15,
                            min_length: 3,
                            value: me.subsystems[sID].commands[cID].Name
                        }, (self) => {
                            if (!me.vaildSubsystemByName(self.input.value)) {
                                return { status: true }
                            }
                            return { status: false, hint: "Name already used." }
                        }, (self) => {
                            let name = self.input.value
                            me.renameCommand(sID, cID, name) //Changes new id
                        })
                    })
                })
            })

            this.subsystems[sID].Node.sortList()
            this.parent.onNewCommand()
            return node

        }
    }
    /*--------------------------------------------------- */
    renameSubsystem(id, name) {
        if (this.vaildSubsystemByID(id)) {
            this.subsystems[id].Node.setTitle(name)
            this.subsystems[id].Name = name
            this.parent.subsystem.sortList()
            this.parent.onRename()
        }
    }
    vaildSubsystemByName(name) {
        for (let subsystem in this.subsystems) {
            if (this.subsystems[subsystem].Name != undefined) {
                if (name == this.subsystems[subsystem].Name) {
                    return true
                }
            }
        }
        return false
    }
    vaildSubsystemByID(id) {
        if (this.subsystems[id] != undefined) {
            return true
        }
        return false
    }
    getSubsystems() {
        return this.subsystems
    }
    deleteSubsystem(id) {
        if (this.vaildSubsystemByID(id)) {
            this.subsystems[id].Node.remove()
            delete this.subsystems[id]
            forklift.App.getPaletteInstance("MAIN").getBoxObject("MENUTABS").closeTab("STRUCTURE", id)
        }
    }
    /*--------------------------------------------------- */
    renameCommand(sID, cID, name) {
        if (this.vaildCommandByID(sID, cID)) {
            this.subsystems[sID].commands[cID].Node.setTitle(name)
            this.subsystems[sID].commands[cID].Name = name
            this.subsystems[sID].Node.sortList()
            this.parent.onNewCommand()
        }
    }
    vaildCommandByName(sID, name) {
        if (this.vaildSubsystemByID(sID)) {
            for (let cID in this.subsystems[sID].commands) {
                if (this.subsystems[sID].commands[cID].Name != undefined) {
                    if (name == this.subsystems[sID].commands[cID].Name) {
                        return true
                    }
                }
            }
        }
        return false
    }
    vaildCommandByID(sID, cID) {
        if (this.vaildSubsystemByID(sID)) {
            if (this.subsystems[sID].commands[cID] != undefined) {
                return true
            }
            return false
        }
    }
    getCommands(sID) {
        if (this.vaildSubsystemByID(sID)) {
            return this.subsystems[sID].commands
        }
        return null
    }
    deleteCommand(sID, cID) {
        if (this.vaildCommandByID(sID, cID)) {
            this.subsystems[sID].commands[cID].Node.remove()
            delete this.subsystems[sID].commands[cID]
            this.parent.onNewCommand()
        }
    }
    /*---------------------------------------------------------------*/
    _getID() {
        return ([1e7] + 1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }
}

class SubsystemCodeEditor {
    constructor(parent, subsystem, section) {
        this.section = section
        this.parent = parent
        this.subsystem = subsystem


        this.title = section.querySelector("#title")
        this.title.innerHTML = parent.handler.subsystems[subsystem].Name

        this.workspace = section.querySelector("#workspace")
        let toolbox = document.querySelector("#subsystemToolbox")
        this.blockly = Blockly.inject(this.workspace, { toolbox: toolbox });
        this.onWindowResize()

        this.selDefaultCommand = new xel.Select(section.querySelector("#selectCommand"))
        this.updateDefaultCommands()

    }
    updateDefaultCommands() {
        this.selDefaultCommand.removeAllItems()
        let commands = forklift.App.getUnit("STRUCTURE").Class.handler.getCommands(this.subsystem)

        for (var cmd in commands) {
            this.selDefaultCommand.addItem(cmd, commands[cmd].Name)
        }
    }
    onRename() {
        this.title.innerHTML = this.parent.handler.subsystems[this.subsystem].Name
        forklift.App.getPaletteInstance("MAIN").getBoxObject("MENUTABS").renameTab("STRUCTURE", this.subsystem, `${this.parent.handler.subsystems[this.subsystem].Name} Subsystem`)
    }
    onSelect() {
        this.onWindowResize()
    }
    onWindowResize() {
        var pxw = (document.documentElement.clientWidth - document.querySelector("rb-sidebar").clientWidth - document.querySelector("rb-sidebar-view").clientWidth) + 'px'
        this.workspace.style.width = pxw
        var pxh = (document.documentElement.clientHeight - document.querySelector("rb-menubar").clientHeight - document.querySelector("rb-menutabs").clientHeight - document.querySelector("rb-console").clientHeight - document.querySelector("rb-console-view").clientHeight) - 60 + 'px'
        this.workspace.style.height = pxh
        Blockly.svgResize(this.blockly);
    }
}
class CommandCodeEditor {
    constructor(parent, subsystem, command, section) {
        this.section = section
        this.parent = parent
        this.subsystem = subsystem


        this.title = section.querySelector("#title")
        this.title.innerHTML = parent.handler.subsystems[subsystem].commands[command].Name

        this.workspace = section.querySelector("#workspace")
        let toolbox = document.querySelector("#subsystemToolbox")
        this.blockly = Blockly.inject(this.workspace, { toolbox: toolbox });
        this.onWindowResize()

        this.selDefaultCommand = new xel.Select(section.querySelector("#selectCommand"))
        this.updateDefaultCommands()

    }
    updateDefaultCommands() {
        this.selDefaultCommand.removeAllItems()
        let commands = forklift.App.getUnit("STRUCTURE").Class.handler.getCommands(this.subsystem)

        for (var cmd in commands) {
            this.selDefaultCommand.addItem(cmd, commands[cmd].Name)
        }
    }
    onWindowResize() {
        var pxw = (document.documentElement.clientWidth - document.querySelector("rb-sidebar").clientWidth - document.querySelector("rb-sidebar-view").clientWidth) + 'px'
        this.workspace.style.width = pxw
        var pxh = (document.documentElement.clientHeight - document.querySelector("rb-menubar").clientHeight - document.querySelector("rb-menutabs").clientHeight - document.querySelector("rb-console").clientHeight - document.querySelector("rb-console-view").clientHeight) - 60 + 'px'
        this.workspace.style.height = pxh
        Blockly.svgResize(this.blockly);
    }
    onRename() {
        this.title.innerHTML = this.parent.handler.subsystems[this.subsystem].Name
        forklift.App.getPaletteInstance("MAIN").getBoxObject("MENUTABS").renameTab("STRUCTURE", this.subsystem, `${this.parent.handler.subsystems[this.subsystem].Name} Subsystem`)
    }
}
class Unit extends forklift.Unit {
    constructor(u) {
        super(u)
        this.controller = {}
        this.subsystemWindows = {}
    }
    onPreload() {
        let me = this

        this.sidebar = forklift.App.getPaletteInstance("SIDEBAR").getBoxObject("SIDEBAR")
        this.console = forklift.App.getPaletteInstance("CONSOLE").getBoxObject("CONSOLE")
        this.content = forklift.App.getPaletteInstance("MAIN").getBoxObject("CONTENTS")

        this.subsystem = this.sidebar.sidebar.addNode("robot_structure")
        this.subsystem.setIcon("apps")
        this.subsystem.setTitle("Structure")
        this.subsystem.onContextMenu(() => {
            contextmenu.openTemp((temp, items) => {
                let new_sub = temp.addItemAbove("new_subsystem")
                new_sub.setTitle("New Subsystem")
                new_sub.onClick(() => {
                    dialogInput.open({
                        title: "New Subsystem",
                        place_holder: "Subsystem Name",
                        max_length: 20,
                        min_length: 3
                    }, (self) => {
                        if (!me.handler.vaildSubsystemByName(self.input.value)) {
                            return { status: true }
                        }
                        return { status: false, hint: "Name already used" }
                    }, (self) => {
                        let name = self.input.value
                        me.handler.newSubsystem(name)
                        temp.close()
                    })
                });
            })
        })

        this.sequences = this.subsystem.addNode("sequences");
        this.sequences.setTitle("Sequences")
        this.sequences.setIcon("dashboard")
        this.sequences.setNoSort()

        this.handler = new StructureHandler(this)
    }
    //For SUBSYSTEM
    onNewCommand() {
        for (let window in this.subsystemWindows) {
            this.subsystemWindows[window].updateDefaultCommands()
        }
        for (let window in this.commandWindows) {
            this.commandWindows[window].updateDefaultCommands()
        }
    }
    /**
     * 
     * @param {*} id 
     * @param {*} section 
     */
    onContentLoad(id, section) {
        if (this.handler.vaildSubsystemByID(id)) {
            this.subsystemWindows[id] = new SubsystemCodeEditor(this, id, section)
        } else {
            this.commandWindows[id] = new CommandCodeEditor(this, id, section)
        }
    }
    /**
     * 
     * @param {*} id 
     */
    onClick(id) {
        for (let window in this.subsystemWindows) {
            if (window == id) {
                this.subsystemWindows[window].onClick()
            }
        }
    }
    /**
     * onRename - MAIN EVENT - Rename of SUBYSTEM
     */
    onRename() {
        for (let window in this.subsystemWindows) {
            this.subsystemWindows[window].onRename()
        }
        for (let window in this.commandWindows) {
            this.commandWindows[window].onRename()
        }
    }
    /**
     * onClose - MAIN EVENT - On close (when not saved) this will run`
     * @param {*} id 
     */
    onClose(id) {
 
    }
    /**
     * onSave - MAIN EVENT - If the section is saved, do any clean up if needed
     * @param {*} id 
     */
    onSave(id) {
        for (let window in this.subsystemWindows) {
            if (window == id) {
                this.subsystemWindows[window].onClose()
            }
        }
        for (let window in this.commandWindows) {
            if (window == id) {
                this.commandWindows[window].onClose()
            }
        }
    }
    /**
     * onDeselect - MAIN EVENT - When tab is deselected, not being used in strucutre.js
     */
    onDeselect() {}
    /**
     * onSelect - MAIN EVENT - When tab is selected, used by any SECTION (Subsystem/Command Code)
     */
    onSelect() {
        for (let window in this.subsystemWindows) {
            this.subsystemWindows[window].onSelect()
        }
        for (let window in this.commandWindows) {
            this.commandWindows[window].onSelect()
        }
    }
    /**
     * isSaved - MAIN EVENT - Is a section SAVED?
     * @param {Section ID} id 
     */
    isSaved(id) {
        if (this.handler.vaildSubsystemByID(id)) {
            //save or whatever
        } else {
            return true
        }
    }
    onWindowResize() {
        for (let window in this.subsystemWindows) {
            this.subsystemWindows[window].onWindowResize()
        }
        for (let window in this.commandWindows) {
            this.commandWindows[window].onWindowResize()
        }
    }
    onConsoleResize() {
        for (let window in this.subsystemWindows) {
            this.subsystemWindows[window].onWindowResize()
        }
        for (let window in this.commandWindows) {
            this.commandWindows[window].onWindowResize()
        }
    }
    onSidebarResize() {
        for (let window in this.subsystemWindows) {
            this.subsystemWindows[window].onWindowResize()
        }
        for (let window in this.commandWindows) {
            this.commandWindows[window].onWindowResize()
        }
    }
    _getID() {
        return ([1e7] + 1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }
}
class SidebarCode {

}

module.exports = Unit



