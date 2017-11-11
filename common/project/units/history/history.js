class HistoryHandler {
    constructor(parent) {
        //The history element
        this.history = forklift.App.getPaletteInstance("SIDEBAR").getBoxObject("SIDEBAR").view.history
        this.btnUndo = new xel.MenuItem("#menu-undo")
        this.btnRedo = new xel.MenuItem("#menu-redo")

        this.btnUndo.onClick(() => {
            this.undoLastEvent()
        });
        this.btnRedo.onClick(() => {
            this.redoLastEvent()
        });

        this.parent = parent
        this.sections = {}
        this.working = false
    }
    addEvent(redo, undo, message) {
        let id = this.selectedID
        if (this.isSection(id)) {
            if (this.hasRedo(id)) {
                let length = Object.keys(this.sections[id].list).length - this.sections[id].location
                for (let i = 1; i < length + 1; i++) {
                    
                    delete this.sections[id].list[i]
                }
                this.updateVisual(id)
                this.sections[id].location = Object.keys(this.sections[id].list).length
                console.log("TOTAL AFTER REDO UNDO:" + Object.keys(this.sections[id].list).length)
            }
            let cID = Object.keys(this.sections[id].list).length + 1
            this.sections[id].list[cID] = {}
            let rID = this._getID()
            this.sections[id].list[cID].rID = rID
            this.sections[id].list[cID].redo = redo
            this.sections[id].list[cID].undo = undo
            this.sections[id].list[cID].message = message

            this.sections[id].list[cID].canUndo = true
            this.sections[id].list[cID].canRedo = false

            this.sections[id].location++
            redo(rID)
        }
        this.updateVisual(id)
    }
    isSection(id) {
        for (let section in this.sections) {
            if (section == id) {
                return true
            }
        }
        return false
    }
    hasRedo(id) {
        for (let item in this.sections[id].list) {
            if (this.sections[id].list[item].canRedo == true) {
                return true
            }
        }
        return false
    }
    updateVisual(id) {
        let canUndo = false
        let canRedo = false
        this.history.innerHTML = "";
        if (this.sections[id].list != undefined) {
            for (let item in this.sections[id].list) {
                if (this.sections[id].list[item].canUndo == true) {
                    canUndo = true
                    this.history.insertAdjacentHTML("beforeend", `<x-card style="margin: 0px; width: 400px" class="undo">
                        <header class="undo">
                            <x-label style="width: 100px;"><strong>Undo</strong></x-label>
                            <x-label>${this.sections[id].list[item].message}</x-label>
                        </header>
                </x-card>`)
                }
                if (this.sections[id].list[item].canRedo == true) {
                    canRedo = true
                    this.history.insertAdjacentHTML("beforeend", `<x-card style="margin: 0px; width: 400px" class="redo">
                     <header class="redo">
                         <x-label style="width: 100px;"><strong>Redo</strong></x-label>
                         <x-label>${this.sections[id].list[item].message}</x-label>
                     </header>
             </x-card>`)
                }
            }
            if (canUndo) {
                this.btnUndo.me.disabled = false
            } else {
                this.btnUndo.me.disabled = true
            }
            if (canRedo) {
                this.btnRedo.me.disabled = false
            } else {
                this.btnRedo.me.disabled = true
            }
        }
    }
    /* ---------------------------------------------------------------------------------------- */
    undoLastEvent() {
        if (this.working == false) {
            this.working == true
            let id = this.selectedID
            if (this.sections[id] != null && this.sections[id].location != 0) {
                let last = this.sections[id].location
                if (this.sections[id].list[last].canUndo == true) {
                    this.sections[id].list[last].canUndo = false
                    this.sections[id].list[last].canRedo = true

                    this.sections[id].list[last].undo(this.sections[id].list[last].rID)
                    this.updateVisual(id)

                    this.sections[id].location = last - 1
                }
            }
            this.working = false
        }
    }
    redoLastEvent() {
        if (this.working == false) {
            this.working == true
            let id = this.selectedID
            if (this.sections[id] != null && this.sections[id].location < Object.keys(this.sections[id].list).length) {
                let next = this.sections[id].location + 1
                if (this.sections[id].list[next].canRedo == true) {
                    this.sections[id].list[next].canUndo = true
                    this.sections[id].list[next].canRedo = false

                    this.sections[id].list[next].redo(this.sections[id].list[next].rID)
                    this.updateVisual(id)

                    this.sections[id].location = next
                }

            }
            this.working = false
        }
    }
    /**
     * onSelect - When a TAB selects a SECTION
     * @param {OLD selected SECTION} oldID 
     * @param {NEW selected SECTION} newID 
     */
    onSelect(oldID, newID) {
        console.log("SELECT")
        this.selectedID = newID
        this.updateVisual(newID)
    }

    /**
     * When a new SECTION is created
     * @param {Section ID} id 
     */
    onNewSection(id) {
        this.sections[id] = {}
        this.sections[id].list = {}
        this.sections[id].location = 0
        this.selectedID = id
        this.updateVisual(id)
    }
    /**
     * When a Section (aka TAB) is closed
     * @param {Section ID} id 
     */
    onClose(id) {
        delete this.sections[id]
    }
    _removeHistory() {
        this.history.remove()
    }
    _getID() {
        return ([1e7] + 1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }
}



class Unit extends forklift.Unit {
    constructor(u) {
        super(u)
        this.setType("EVENTS")
    }
    /**
     * Preload Event - Defined by MAIN Palette
     */
    onPreload() {
        this.handler = new HistoryHandler(this)
    }
    /**
     * onAnySelect - Event for handling all tab selection
     * @param {The OLD Tab ID} oldID 
     * @param {The NEW Tab ID} newID 
     */
    onAnySelect(oldID, newID) {
        this.handler.onSelect(oldID, newID)
    }
    onSectionCreation(sectionID, section) {
        this.handler.onNewSection(sectionID)
    }
    onAnySave() { }
    onAnyClose() {
        this.handler.onClose()
    }
    onWindowResize() { }
    onConsoleResize() { }
    onSidebarResize() { }
}

module.exports = Unit