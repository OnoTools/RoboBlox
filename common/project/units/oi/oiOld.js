class OperatorInterfaceOld {
    constructor(parent) {
        this.parent = parent
        this.content = forklift.App.getPaletteInstance("MAIN").getBoxObject("CONTENTS")

        /* Main Variables */
        this.controllerList = {}
        this.totalControllers = 0

        this.modified = false
        this.gamepads = {}

        this.dialogOI = new DialogOI()

        this.loaded = true
    }
    load(section) {
        this.section = section
        var me = this

        if (!this.content.storage.isCell("OI:GamepadMapping")) {
            this.gamepads = this.content.storage.loadTemplate(`./templates/definedGamepads.json`)
            this.content.storage.saveStorageCell("OI:GamepadMapping", this.gamepads)
        } else {
            this.gamepads = this.content.storage.getStorageCell("OI:GamepadMapping")
        }
        this.tree = new xel.TreeView("#oi-tree", "oi-tree")

        this.controller = this.tree.addNode("control")
        this.controller.setIcon("videogame-asset")
        this.controller.setTitle("Controller(s)")

        var oi_add = this.section.querySelector("#oi-add")
        var oi_type = new xel.Select(document.querySelector("#oi-type"))

        for (let gamepad in this.gamepads) {
            if (this.gamepads[gamepad].default == true) {
                oi_type.addItem(gamepad, this.gamepads[gamepad].language.name[globalLanguage], null, true)
            } else {
                oi_type.addItem(gamepad, this.gamepads[gamepad].language.name[globalLanguage])
            }
        }
        oi_add.addEventListener("click", () => {
            this._modified()
            this._addController({
                "type": oi_type.value
            })
        })
        this._loadControllers() 
        this.loaded = true
    }
    /**
    * Adds a controller to the list of all controller
    * @return {array} All commands from given subsystem ID.
      - .name = name
      - .file = id/file id
    * @this Sidebar
    */
    _addController(data) {
        var context = new xel.ContextMenu()
        var me = this // Define me as internally this
        if (me.totalControllers < 10) {
            me.totalControllers = me.totalControllers + 1
            var id = me.totalControllers
            me.controllerList[id] = {}
            if (me.gamepads[data.type] != undefined) {
                me.controllerList[id].type = data.type
                me.controllerList[id].type_name = me.gamepads[data.type].language.name[globalLanguage]
                me.controllerList[id].controller = this.controller.addNode(id)
                var defaultName = "Controller " + String(id) + ` {${me.controllerList[id].type_name}}`
                me.controllerList[id].controller.setTitle(defaultName)
                me.controllerList[id].controller.setIcon("gamepad")
                me.controllerList[id].controller.me.style.fontSize = "20px"
                me.controllerList[id].controller.onContextMenu(() => {
                    context.openTemp((self, items) => {
                        var add = self.addItemAbove("oi-add")
                        add.setTitle("Remove Last Controller")
                        add.setIcon("delete")
                        add.onClick(() => {
                            self.close()
                            prompt.show("Do you want to delete the last controller?", (response) => {
                                if (response == true) {
                                    me._oi_contoller_delete()
                                }
                            })
                        })
                        self.addSepAbove();
                        var define = self.addItemAbove("oi-define")
                        define.setTitle("Define Controller")
                        define.setIcon("text-format")
                        define.onClick(() => {
                            self.close()
                            if (me.controllerList[id].defined != null) {
                                var value = me.controllerList[id].defined
                            } else {
                                var value = ""
                            }
                            dialogInput.open({
                                title: `Define Controller ${id}`,
                                place_holder: "Controller Name",
                                max_length: 20,
                                value: value
                            }, (self) => {
                                return {
                                    status: true
                                }
                            }, (self) => {
                                var data = self.input.value
                                me._defineController(id, data)
                                this._modified()
                            })
                        })
                    })
                })

                me.controllerList[id].buttons = {}

                var buttons = this.gamepads[data.type].buttons
                var buttonData = null
                if (data.buttons != undefined) {
                    buttonData = data.buttons
                }
                for (let key in buttons) {
                    var button = buttons[key]
                    if (buttons)
                        var name = this.gamepads[data.type].language[key][globalLanguage]
                    var color = button.color
                    me.controllerList[id].buttons[key] = {}
                    me.controllerList[id].buttons[key].obj = me.controllerList[id].controller.addNode(key)
                    me.controllerList[id].buttons[key].obj.setTitle(name)
                    if (color != null) {
                        me.controllerList[id].buttons[key].obj.setColor(color)
                    }
                    me.controllerList[id].buttons[key].obj.setIcon("gamepad")
                    me.controllerList[id].controller.close()
                    me.controllerList[id].buttons[key].whenPressed = {}
                    me.controllerList[id].buttons[key].whenReleased = {}
                    me.controllerList[id].buttons[key].whileHeld = {}

                    me.controllerList[id].buttons[key].whenPressed.obj = me.controllerList[id].buttons[key].obj.addNode("whenPressed_" + key)
                    me.controllerList[id].buttons[key].whenPressed.obj.setTitle("WHEN PRESSED")
                    me.controllerList[id].buttons[key].whenPressed.obj.setIcon("get-app")
                    me.controllerList[id].buttons[key].whenPressed.obj.onClick(() => {
                        this.dialogOI.open({
                            title: "Add Command for WHEN PRESSED",
                            button: key,
                            command: me.controllerList[id].buttons[key].whenPressed.command,
                            subsystem: me.controllerList[id].buttons[key].whenPressed.subsystem
                        }, (self) => {
                            me.controllerList[id].buttons[key].whenPressed.subsystem = self.subsystem.value
                            me.controllerList[id].buttons[key].whenPressed.command = self.command.value
                            me.controllerList[id].buttons[key].whenPressed.obj.setColor("lightgreen")
                            me._modified()
                        })
                    })
                    me.controllerList[id].buttons[key].whenPressed.obj.onContextMenu(() => {
                        context.openTemp((self, items) => {
                            if (me.controllerList[id].buttons[key].whenPressed.command != null && me.controllerList[id].buttons[key].whenPressed.subsystem != null) {
                                var add = self.addItemAbove("remove-binding")
                                add.setTitle("Remove Command Binding")
                                add.setIcon("delete")
                                add.onClick(() => {
                                    me.controllerList[id].buttons[key].whenPressed.subsystem = null
                                    me.controllerList[id].buttons[key].whenPressed.command = null
                                    me.controllerList[id].buttons[key].whenPressed.obj.removeColor()
                                })
                            }
                        })
                    })
                    try {
                        if (data.buttons[key].whenPressed != null) {
                            if (buttonData != null && data.buttons[key].whenPressed.subsystem != null && data.buttons[key].whenPressed.command != null) {
                                me.controllerList[id].buttons[key].whenPressed.subsystem = data.buttons[key].whenPressed.subsystem
                                me.controllerList[id].buttons[key].whenPressed.command = data.buttons[key].whenPressed.command
                                me.controllerList[id].buttons[key].whenPressed.obj.setColor("lightgreen")
                            }
                        }
                    } catch (e) {

                    }
                    me.controllerList[id].buttons[key].whenReleased.obj = me.controllerList[id].buttons[key].obj.addNode("whenReleased_" + key)
                    me.controllerList[id].buttons[key].whenReleased.obj.setTitle("WHEN RELEASED")
                    me.controllerList[id].buttons[key].whenReleased.obj.setIcon("publish")
                    me.controllerList[id].buttons[key].whenReleased.obj.onClick(() => {
                        this.dialogOI.open({
                            title: "Add Command for WHEN RELEASED",
                            button: key,
                            command: me.controllerList[id].buttons[key].whenReleased.command,
                            subsystem: me.controllerList[id].buttons[key].whenReleased.subsystem
                        }, (self) => {
                            me.controllerList[id].buttons[key].whenReleased.subsystem = self.subsystem.value
                            me.controllerList[id].buttons[key].whenReleased.command = self.command.value
                            me.controllerList[id].buttons[key].whenReleased.obj.setColor("lightgreen")
                            me._modified()
                        })
                    })
                    me.controllerList[id].buttons[key].whenReleased.obj.onContextMenu(() => {
                        context.openTemp((self, items) => {
                            if (me.controllerList[id].buttons[key].whenReleased.command != null && me.controllerList[id].buttons[key].whenReleased.subsystem != null) {
                                var add = self.addItemAbove("remove-binding")
                                add.setTitle("Remove Command Binding")
                                add.setIcon("delete")
                                add.onClick(() => {
                                    me.controllerList[id].buttons[key].whenReleased.subsystem = null
                                    me.controllerList[id].buttons[key].whenReleased.command = null
                                    me.controllerList[id].buttons[key].whenReleased.obj.removeColor()
                                })
                            }
                        })
                    })
                    try {
                        if (data.buttons[key].whenReleased != null) {
                            if (buttonData != null && data.buttons[key].whenReleased.subsystem != null && data.buttons[key].whenReleased.command != null) {
                                me.controllerList[id].buttons[key].whenReleased.subsystem = data.buttons[key].whenReleased.subsystem
                                me.controllerList[id].buttons[key].whenReleased.command = data.buttons[key].whenReleased.command
                                me.controllerList[id].buttons[key].whenReleased.obj.setColor("lightgreen")
                            }
                        }
                    } catch (e) {

                    }
                    me.controllerList[id].buttons[key].whileHeld.obj = me.controllerList[id].buttons[key].obj.addNode("whileHeld_" + key)
                    me.controllerList[id].buttons[key].whileHeld.obj.setTitle("WHILE HELD")
                    me.controllerList[id].buttons[key].whileHeld.obj.setIcon("gamepad")
                    me.controllerList[id].buttons[key].whileHeld.obj.onClick(() => {
                        this.dialogOI.open({
                            title: "Add Command for WHILE HELD",
                            button: key,
                            command: me.controllerList[id].buttons[key].whileHeld.command,
                            subsystem: me.controllerList[id].buttons[key].whileHeld.subsystem
                        }, (self) => {
                            me.controllerList[id].buttons[key].whileHeld.subsystem = self.subsystem.value
                            me.controllerList[id].buttons[key].whileHeld.command = self.command.value
                            me.controllerList[id].buttons[key].whileHeld.obj.setColor("lightgreen")
                            me._modified()
                        })
                    })
                    me.controllerList[id].buttons[key].whileHeld.obj.onContextMenu(() => {
                        context.openTemp((self, items) => {
                            if (me.controllerList[id].buttons[key].whileHeld.command != null && me.controllerList[id].buttons[key].whileHeld.subsystem != null) {
                                var add = self.addItemAbove("remove-binding")
                                add.setTitle("Remove Command Binding")
                                add.setIcon("delete")
                                add.onClick(() => {
                                    me.controllerList[id].buttons[key].whileHeld.subsystem = null
                                    me.controllerList[id].buttons[key].whileHeld.command = null
                                    me.controllerList[id].buttons[key].whileHeld.obj.removeColor()
                                })
                            }
                        })
                    })
                    try {
                        if (data.buttons[key].whileHeld != null) {
                            if (buttonData != null && data.buttons[key].whileHeld.subsystem != null && data.buttons[key].whileHeld.command != null) {
                                me.controllerList[id].buttons[key].whileHeld.subsystem = data.buttons[key].whileHeld.subsystem
                                me.controllerList[id].buttons[key].whileHeld.command = data.buttons[key].whileHeld.command
                                me.controllerList[id].buttons[key].whileHeld.obj.setColor("lightgreen")
                            }
                        }
                    } catch (e) {

                    }
                    me.controllerList[id].buttons[key].obj.close()
                    if (data.name != null || data.name != undefined) {
                        this._defineController(id, data.name)
                    }
                }
            }
        }
    }
    _defineController(id, data) {
        if (this._vaildController(id)) {
            var defaultName = `Controller ${id} {${this.controllerList[id].type_name}}`
            if (data == "") {
                this.controllerList[id].controller.setTitle(defaultName)
            } else {
                this.controllerList[id].controller.setTitle(defaultName + ` [${data}]`)
            }
            this.controllerList[id].defined = data
        }
    }
    _vaildController(id) {
        if (this.controllerList[id] != null) {
            return true
        }
        return false
    }
    _usuableCommand(sub, cmd, button) {
        var pass = true
        for (var con in this.controllerList) {
            for (var key in this.controllerList[con].buttons) {
                if (this.controllerList[con].buttons[key].whenPressed.subsystem == sub) {
                    if (this.controllerList[con].buttons[key].whenPressed.command == cmd && key != button) {
                        pass = false
                    }
                }
                if (this.controllerList[con].buttons[key].whenReleased.subsystem == sub) {
                    if (this.controllerList[con].buttons[key].whenReleased.command == cmd && key != button) {
                        pass = false
                    }
                }
                if (this.controllerList[con].buttons[key].whileHeld.subsystem == sub) {
                    if (this.controllerList[con].buttons[key].whileHeld.command == cmd && key != button) {
                        pass = false
                    }
                }
            }
        }
        return pass
    }
    _saveControllers() {
        let id = 0
        var data = {}
        for (let con in this.controllerList) {
            id = id + 1
            data[id] = {}
            data[id].name = this.controllerList[id].defined
            data[id].type = this.controllerList[con].type
            data[id].buttons = {}
            for (let btn in this.controllerList[con].buttons) {
                if (this.controllerList[con].buttons[btn].whenPressed.subsystem != null || this.controllerList[con].buttons[btn].whenReleased.subsystem != null || this.controllerList[con].buttons[btn].whileHeld.subsystem != null) {
                    data[id].buttons[btn] = {}
                }
                if (this.controllerList[con].buttons[btn].whenPressed.subsystem != null) {
                    data[id].buttons[btn].whenPressed = {}
                    data[id].buttons[btn].whenPressed.subsystem = this.controllerList[con].buttons[btn].whenPressed.subsystem
                    data[id].buttons[btn].whenPressed.command = this.controllerList[con].buttons[btn].whenPressed.command
                }
                if (this.controllerList[con].buttons[btn].whenReleased.subsystem != null) {
                    data[id].buttons[btn].whenReleased = {}
                    data[id].buttons[btn].whenReleased.subsystem = this.controllerList[con].buttons[btn].whenReleased.subsystem
                    data[id].buttons[btn].whenReleased.command = this.controllerList[con].buttons[btn].whenReleased.command
                }
                if (this.controllerList[con].buttons[btn].whileHeld.subsystem != null) {
                    data[id].buttons[btn].whileHeld = {}
                    data[id].buttons[btn].whileHeld.subsystem = this.controllerList[con].buttons[btn].whileHeld.subsystem
                    data[id].buttons[btn].whileHeld.command = this.controllerList[con].buttons[btn].whileHeld.command
                }
            }
        }
    }
    _loadControllers() {
        let temp = {}
        let data = {}

        data = this.content.storage.getStorageCell("OI:GamepadMapping")

        for (let con in data) {
            if (data[con].type != null) {
                this._addController({
                    "type": data[con].type,
                    "buttons": data[con].buttons,
                    "name": data[con].name
                })
            }
        }
    }
    _deleteCommand(sID, cID) {
        for (var con in this.controllerList) {
            for (var key in this.controllerList[con].buttons) {
                if (this.controllerList[con].buttons[key].whenPressed.subsystem == sID && this.controllerList[con].buttons[key].whenPressed.command == cID) {
                    this.controllerList[con].buttons[key].whenPressed.subsystem = null
                    this.controllerList[con].buttons[key].whenPressed.command = null
                    this.controllerList[con].buttons[key].whenPressed.obj.removeColor()
                }
                if (this.controllerList[con].buttons[key].whenReleased.subsystem == sID && this.controllerList[con].buttons[key].whenReleased.command == cID) {
                    this.controllerList[con].buttons[key].whenReleased.subsystem = null
                    this.controllerList[con].buttons[key].whenReleased.command = null
                    this.controllerList[con].buttons[key].whenReleased.obj.removeColor()
                }
                if (this.controllerList[con].buttons[key].whileHeld.subsystem == sID && this.controllerList[con].buttons[key].whileHeld.command == cID) {
                    this.controllerList[con].buttons[key].whileHeld.subsystem = null
                    this.controllerList[con].buttons[key].whileHeld.command = null
                    this.controllerList[con].buttons[key].whileHeld.obj.removeColor()
                }
            }
        }
    }
    _deleteSubsystem(sID) {
        for (var con in this.controllerList) {
            for (var key in this.controllerList[con].buttons) {
                if (this.controllerList[con].buttons[key].whenPressed.subsystem == sID) {
                    this.controllerList[con].buttons[key].whenPressed.subsystem = null
                    this.controllerList[con].buttons[key].whenPressed.command = null
                    this.controllerList[con].buttons[key].whenPressed.obj.removeColor()
                }
                if (this.controllerList[con].buttons[key].whenReleased.subsystem == sID) {
                    this.controllerList[con].buttons[key].whenReleased.subsystem = null
                    this.controllerList[con].buttons[key].whenReleased.command = null
                    this.controllerList[con].buttons[key].whenReleased.obj.removeColor()
                }
                if (this.controllerList[con].buttons[key].whileHeld.subsystem == sID) {
                    this.controllerList[con].buttons[key].whileHeld.subsystem = null
                    this.controllerList[con].buttons[key].whileHeld.command = null
                    this.controllerList[con].buttons[key].whileHeld.obj.removeColor()
                }
            }
        }
    }

    // REMOVE A CONTROLLER
    _oi_contoller_delete() {
        this.controllerList[this.totalControllers].controller.remove()
        delete this.controllerList[this.totalControllers]
        this.totalControllers = this.totalControllers - 1
    }
    _modified() {
        this.menutabs = forklift.App.getPaletteInstance("MAIN").getBoxObject("MENUTABS")
        if (!this.modified) {
            this.menutabs.tabs.setSelectedEdited(true)
            this.parent.saved = false
        }
    }
}