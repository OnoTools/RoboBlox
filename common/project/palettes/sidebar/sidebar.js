class SidebarMain extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-sidebar/sidebar.shadow.html")
        this.loadContent("elements/rb-sidebar/sidebar.html")
    }
    onBoxLoad() {
        this.shadowBox = this.element.shadow.querySelector("rb-box")
    }
    onContentLoad() {
        let me = this
        this.node = {}

        this.subsystemNodes = {}
        this.commandNodes = {}

        this.subsystemData = {}
        this.commandNames = {}

        this.eventObjects = {}

        this.sidebar = new xel.TreeView("#sidebar-tree", "sidebar")

        this.view = {}
        this.view.object = this.element.querySelector("#view")
        this.view.explorer = this.view.object.querySelector("#explorer")
        this.view.history = this.view.object.querySelector("#history")

        this.tabs = {}
        this.tabs.object = this.element.querySelector("#tabs")
        this.tabs.explorer = this.tabs.object.querySelector("#explorer")
        this.tabs.explorer.addEventListener("click", () =>{
            me.showExplorer()
        })
        this.tabs.history = this.tabs.object.querySelector("#history")
        this.tabs.history.addEventListener("click", () => {
            me.showHistory()
        })

        window.addEventListener('resize', () => {
            me.resize()
        }, false)   
        this.resize()

        this.project = this.element.querySelector("#project-titlename")
        this.project.innerHTML = args.name
        this.load()
        
    }
    show() {
        this.shadowBox.style.width = "400px"
        this.tabs.object.style.display = ""
        this.shadowBox.style.display = ""
    }
    hide() {
        this.shadowBox.style.width = "0px"
        this.tabs.object.style.display = "none"
        this.shadowBox.style.display = "none"
    }
    load() {
        let me = this
        this.node.robot = this.sidebar.addNode("main")
        this.node.robot.setIcon("home")
        this.node.robot.setTitle("Main")
    }
    resize() {
        if (this.section == "history") {
            let height = document.documentElement.clientHeight - document.querySelector("rb-menubar").clientHeight - document.querySelector("rb-menutabs").clientHeight - 185
            this.view.object.style.minHeight = height + "px"
        } else {
            let height = document.documentElement.clientHeight - document.querySelector("rb-menubar").clientHeight - document.querySelector("rb-menutabs").clientHeight - 50
            this.view.object.style.minHeight = height + "px"
        }
    }
    showExplorer() {
        this.section = "explorer"
        this.view.explorer.style.display = "block"
        this.view.history.style.display = "none"
        this.resize()
    }
    showHistory() {
        this.section = "history"
        this.view.history.style.display = "block"
        this.view.explorer.style.display = "none"
        this.resize()
    }
}
class View extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-sidebar-view/sidebar-view.shadow.html")
        this.loadContent("elements/rb-sidebar-view/sidebar-view.html")
        this.toggle = false
    }
    onContentLoad() {
        let me = this
        let run = () => {
            if (me.toggle) {
                me.show(true)
            } else {
                me.show(false)
            }
        }
        this.parent = forklift.App.getPaletteInstance("SIDEBAR").getBox("SIDEBAR")
        this.menu_item = new xel.MenuItem("#menu-view-sidebar")

        this.menu_item.onClick(() => {
            run()
        });
        this.menu_item.setIcon("check")
        this.menu_item.setTitle("Sidebar")

        this.element.addEventListener("click", run)
        
    }
    show(data) {
        if (data == false || data == "false") {
            this.w = true

            this.parent.object.hide()
            this.updateMenuItem(false)
            this.element.setAttribute("show", "false")
            this.toggle = true

            this.w = false
            this.callEvent("onSidebarResize", [false])
        } else {
            this.w = true

            this.parent.object.show()
            this.element.setAttribute("show", "true")
            this.updateMenuItem(true)
            this.toggle = false

            this.w = false
            this.callEvent("onSidebarResize", [true])
        }
    }
    updateMenuItem(data) {
        if (data) {
            this.menu_item.setIcon("check")
            this.menu_item.setTitle("Sidebar")
        } else {
            this.menu_item.setIcon("")
            this.menu_item.setTitle("Sidebar")
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
        this.addBox("SIDEBAR", "rb-sidebar", SidebarMain)
        this.addBox("SIDEBAR-VIEW", "rb-sidebar-view", View)
    }
}
module.exports = Palette