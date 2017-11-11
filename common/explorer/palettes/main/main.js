const jetpack = require('fs-jetpack')
const path = require('path')

class Menubar extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-menubar/menubar.shadow.html")
        this.loadContent("elements/rb-menubar/menubar.html")
    }
    onContentLoad() { 
        console.log("ADDED MENUBAR")
        this.title_menubar = new xel.TitleMenubar(windowID, "#menubar")
        this.title_menubar.addClose()
        this.title_menubar.addMinimize()
        this.title_menubar.build()
    }
}
class StorageSystem {
    constructor(parent) {
        this.parent = parent

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

        this.profilePath = path.join(home, '.roboblox/config.json')
        this.projectList = path.join(home, '.roboblox/projectList.json')


        if (!jetpack.exists(this.profilePath)) {
            const template_c = require('./templates/config.json')
            jetpack.write(this.profilePath, template_c)
        }
        try {
            const config = require(this.profilePath)
            this.config = config;
        } catch (e) {
            this.config = null
        }

        if (!jetpack.exists(this.projectList)) {
            const template_r = require('./templates/projectList.json')
            jetpack.write(this.projectList, template_r)
        }
        try {
            const projects = require(this.projectList)
            this.projects = projects
        } catch (e) {
            this.projects = null
        }

        this.data = {}
    }
    getProjects() {
        return this.projects
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
class Content extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-content/content.shadow.html")
        this.loadContent("elements/rb-content/content.html")
        this.storage = new StorageSystem(this)
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
        this.addBox("PREFRENCES", "rb-prefrences", Prefrences)
    }
}

module.exports = Palette