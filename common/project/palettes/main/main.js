const jetpack = require('fs-jetpack')
const path = require('path')

class Menubar extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-menubar/menubar.shadow.html")
        this.loadContent("elements/rb-menubar/menubar.html")
    }
    onBoxLoad() { }
    onContentLoad() { }
    onUnitLoad() {
        let data = managerLocal.parseArgs()
        console.log(data)
        this.title_menubar = new xel.TitleMenubar(data.id, "#menubar")
        this.title_menubar.addClose()
        this.title_menubar.addMinimize()
        this.title_menubar.addZoom()
        this.title_menubar.build()

    }
}
class Menutabs extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-menutabs/menutabs.shadow.html")
        this.loadContent("elements/rb-menutabs/menutabs.html")
    }
    onUnitLoad() {
        this.loadTabs()
    }
    loadTabs() {
        let me = this

        this.main = forklift.App.getPaletteInstance("MAIN").getBoxObject("CONTENTS")

        this.tabs = new xel.MenuTabs("x-doctabs")
        this.tabs.setupTabs()

        this.tabs.onTabClose((id) => {
            let data = id.split(":")
            let baseID = data[0]
            let sectionID = data[1]

            let saved = false
            try {
                saved = me.callEvent("isSaved", [sectionID], true, baseID)
            }
            catch (err) {
                console.log(err)
            }
            if (!saved && saved != undefined) {
                var buttons = ['Save', 'Close withot saving', 'Cancel']
                prompt.show("Do you want to save?", (response) => {
                    if (response == true) {
                        me.callEvent("onSave", [sectionID], false, baseID)
                        me.closeTab(baseID, sectionID)
                    } else {
                        me.closeTab(baseID, sectionID)
                    }
                })
            } else {
                me.closeTab(baseID, sectionID)
            }
        })
        this.tabs.hideButton()
        this.tabs.onNew((type) => { })

        this.tabs.onTabClick((id) => {
            let last = me.tabs.getLastSelectedTab()

            let data = last.split(":")
            let baseID = data[0]
            let sectionID = data[1]

            me.callEvent("onDeselect", [sectionID], false, baseID)
            let oldSectionID = sectionID

            data = id.split(":")
            baseID = data[0]
            sectionID = data[1]

            me.main.manager.showSection(baseID, sectionID)
            me.callEvent("onSelect", [sectionID], false, baseID)
            me.callEvent("onAnySelect", [oldSectionID, sectionID], false, null, "EVENTS")
        })
    }
    closeTab(baseID, sectionID) {
        var id = `${baseID}:${sectionID}`
        this.callEvent("onClose", [sectionID], false, baseID)
        this.callEvent("onDeselect", [sectionID], false, baseID)
        let tab = this.tabs.getTabByID(id)
        this.tabs.end(tab);

        this.main.manager.removeSection(baseID, sectionID)

        tab = this.tabs.getSelectedTab()
        let selected_id = this.tabs.getID(tab)

        let data = selected_id.split(":")
        baseID = data[0]
        sectionID = data[1]

        this.main.manager.showSection(baseID, sectionID)
    }
    renameTab(baseID, sectionID, name) {
        var id = `${baseID}:${sectionID}`
        let tab = this.tabs.getTabByID(id)
        this.tabs.setName(tab, name)
    }
}
class StorageSystem {
    constructor(content, parent) {
        this.parent = parent
        this.content = content

        this.loaded = false
        this.file = ""

        const cwd = process.cwd()
        const portableHome = path.join(cwd, 'portable')
        if (require('fs').existsSync(portableHome)) {
            process.env.ROBOBLOX_HOME = portableHome
        }
        const home = process.env.ROBOBLOX_HOME || require('os').homedir()
        this.home = home

        this.packages = path.join(home, '.roboblox/packages/')



        this.data = {}
    }
    loadProject(file) {
        console.log(file)
        if (!this.loaded) {
            this.file = file
            try {
                const data = require(file)
                this.data = data
                this.loaded = true
            } catch (e) {
                return null
            }
        }
    }
    saveProject() {
        if (this.loaded) {
            jetpack.write(this.file, this.data)
        }
    }
    loadTemplate(file) {
        try {
            const data = require(file)
            console.log(data)
            return data
        } catch (e) {
            console.log(e)
            return null
        }
    }
    getStorageCell(id) {
        if (this.data[id] != undefined) {
            return this.data[id]
        }
    }
    saveStorageCell(id, data) {
        this.data[id] = data
    }
    isCell(id) {
        if (this.data[id] != undefined) {
            return true
        }
        return false
    }
}
class ContentManager {
    constructor(parent, content) {
        this.parent = parent
        this.content = content
        this.loadSection()
        this.menutabs = forklift.App.getPaletteInstance("MAIN").getBoxObject("MENUTABS")
    }
    loadSection() {
        var sections = this.content.querySelectorAll('section')
        this.sections = {}
        //Loop through the view sections
        for (var i = 0; i < sections.length; ++i) {
            var data = sections[i].dataset.id.split(":")
            if (data.length == 2) {
                var baseID = data[0]
                var sectionID = data[1]

                if (this.sections[baseID] == undefined) {
                    this.sections[baseID] = {}
                }
                this.sections[baseID][sectionID] = sections[i]
            }
        }
    }
    addSection(baseID, sectionID) {
        var id = `${baseID}:${sectionID}`

        this.content.insertAdjacentHTML("afterbegin", `<section data-id="${id}">
        <section   style="position: relative;  margin: auto; margin-top: 20%; right: 0; bottom: 0; left: 0; border-radius: 3px; text-align: center;">
        <x-label style="font-size: 72px;" class="rb-font">
          <span class="bold">LOADING</span>
          </x-label>
      </section>
      </section>`)
        let newSection = this.content.querySelector(`[data-id='${id}']`)
        if (this.sections[baseID] == undefined) {
            this.sections[baseID] = {}
        }
        this.sections[baseID][sectionID] = newSection
    }
    openSection(file, baseID, sectionID, name, icon) {
        if (!this._isSection(baseID, sectionID)) {
            this.addSection(baseID, sectionID)
            var id = `${baseID}:${sectionID}`
            this.menutabs.tabs.addTab(id)
            let tab = this.menutabs.tabs.getSelectedTab()
            this.menutabs.tabs.setName(tab, name)
            if (icon != null) {
                this.menutabs.tabs.setIcon(tab, icon)
            }
            this.showSection(baseID, sectionID)
            let section = this.getSection(baseID, sectionID)
            let me = this
            let html = ""
            let feedback = forklift.API.load(file, (data) => {
                if (data != null) {
                    html = data.responseText
                    html = html.split("<template>")[1].split("</template>")[0]
                    section.innerHTML = html
                } else {
                    forklift.API.log(`[forklift.js] %cCannot load '${file}'`, 'color: red')
                }
                me.parent.callEvent("onContentLoad", [sectionID, section], false, baseID)
                me.parent.callEvent("onSectionCreation", [sectionID, section], false, null, "EVENTS") //EVENTS
                me.parent.callEvent("onSelect", [sectionID], false, baseID)
            })
            if (!feedback) {
                forklift.API.log(`[forklift.js] %cCannot find content '${file}'`, 'color: red')
            }
        } else {
            var id = `${baseID}:${sectionID}`
            this.showSection(baseID, sectionID)
            this.menutabs.tabs.setSelectedTab(id)
            this.parent.callEvent("onSelect", [sectionID], false, baseID)
        }
    }
    showSection(baseID, sectionID) {
        if (this._isSection(baseID, sectionID)) {
            for (let base in this.sections) {
                for (let section in this.sections[base]) {
                    if (String(section) != String(sectionID)) {
                        this.hideSection(base, section)
                    }
                }
            }
            this.getSection(baseID, sectionID).style.display = "block"
        }
    }
    hideSection(baseID, sectionID) {
        if (this._isSection(baseID, sectionID)) {
            let section = this.getSection(baseID, sectionID)
            section.style.display = "none"
        } else {
        }
    }
    removeSection(baseID, sectionID) {
        if (this._isSection(baseID, sectionID)) {
            this.getSection(baseID, sectionID).remove()
            delete this.sections[baseID][sectionID]
            //delete baseID if no section exist
        }
    }
    getSection(baseID, sectionID) {
        if (this._isSection(baseID, sectionID)) {
            return this.sections[baseID][sectionID]
        }
        return null
    }
    _isSection(baseID, sectionID) {
        if (this.sections[baseID] != undefined) {
            if (this.sections[baseID][sectionID] != undefined) {
                return true
            }
        }
        return false
    }
}
class Content extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-content/content.shadow.html")
        this.loadContent("elements/rb-content/content.html")
    }
    onUnitLoad() {
        let me = this
        let content = this.element.querySelector("#rb-content")
        this.manager = new ContentManager(this, content)
        this.storage = new StorageSystem(this, content)
        this.storage.loadProject("./file.json")
        this.callEvent("onPreload")
        window.addEventListener('resize', () => {
            me.callEvent("onWindowResize") //Calls resize event for every unit binded
        }, false)

        
    }
    openSection(file, baseID, sectionID, name, icon) {
        this.manager.openSection(file, baseID, sectionID, name, icon)
    }

}

class Box extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-box/box.shadow.html")
        this.loadContent()
    }
}

class Prefrences extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-prefrences/prefrences.shadow.html")
        this.loadContent("elements/rb-prefrences/prefrences.html")
    }
}
class Palette extends forklift.PaletteLoader {
    constructor(id) {
        super(id)
        this.addBox("CONTENTS", "rb-content", Content)
        this.addBox("BOX", "rb-box", Box)
        this.addBox("MENUBAR", "rb-menubar", Menubar)
        this.addBox("MENUTABS", "rb-menutabs", Menutabs)
        this.addBox("PREFRENCES", "rb-prefrences", Prefrences)
    }
}

module.exports = Palette