class Unit extends forklift.Unit{
    constructor(u) {
        super(u)
    }
    onPreload() {
        forklift.API.log(`%c${this.pid}:${this.id}`, 'color: gray')
        let me = this
        this.sidebar = forklift.App.getPalette("SIDEBAR").Class.getBox("SIDEBAR").object
        this.console = forklift.App.getPalette("CONSOLE").Class.getBox("CONSOLE").object

        this.map = this.sidebar.node.robot.addNode("map")
        this.map.setIcon("usb")
        this.map.setTitle("Map")
        this.map.onClick(() => {
            me.console.logMessage("~30px~ #0011ff ROBOT MAP")
        })   
    }
    onLoad() {

    }
    onTabClick() {
        
    }
    onClose() {

    }
    onSave() {

    }
    isSaved() {
        console.log("MAP IS SAVING")
        return false
    }
}

module.exports = Unit