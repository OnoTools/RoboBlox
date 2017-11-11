class Sidebar extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-sidebar/sidebar.shadow.html")
        this.loadContent("elements/rb-sidebar/sidebar.html")
    }
    onContentLoad() {
        let me = this


        let projects = forklift.App.getPaletteInstance("MAIN").getBoxObject("CONTENTS").storage.getProjects()
        console.log(forklift.App.getPaletteInstance("MAIN").getBoxObject("CONTENTS").storage)
        for (var key in projects) {
            console.log("KEY:" + key)
            if (projects.hasOwnProperty(key)) {
                let project = projects[key];
                this.element.insertAdjacentHTML('beforeend', ` <x-box vertical class="project-box"></x-box>`)
                let boxes = this.element.querySelectorAll("x-box");
                let box = boxes[boxes.length - 1];

                box.insertAdjacentHTML('beforeend', `<x-label class="title"></x-label>`)
                let labels = this.element.querySelectorAll("x-label");
                let title = labels[labels.length - 1];
                title.innerHTML = title.innerHTML = project.name;
                box.insertAdjacentHTML('beforeend', `<x-label class="text"><span class="bold">Location: </span></x-label>`)
                labels = this.element.querySelectorAll("x-label");
                let location = labels[labels.length - 1];
                location.innerHTML = location.innerHTML + project.location

                box.insertAdjacentHTML('beforeend', `<x-label class="text"><span class="bold">Last Edited: </span></x-label>`)
                labels = this.element.querySelectorAll("x-label");
                let last_edited = labels[labels.length - 1];
                last_edited.innerHTML = last_edited.innerHTML + project.last_edited

                box.insertAdjacentHTML('beforeend', `<x-label class="text"><span class="bold">Team #: </span></x-label>`)
                labels = this.element.querySelectorAll("x-label");
                let team_number = labels[labels.length - 1];
                team_number.innerHTML = team_number.innerHTML + project.team_number

                box.addEventListener("contextmenu", function () {
                    projectContextMenu(key, project.name, project.location)
                })
                box.addEventListener("click", function () {
                    me.openProject(key, project.name, project.location)

                })

            }
        }
    }
    openProject(key, name, location) {
        let mainWin = managerRemote.createWindow({
            show: false,
            width: 1000,
            height: 800,
            frame: false,
            color: "#000",
            webPreferences: {
               zoomFactor: 0.9,
             },
            icon: path.join(managerRemote.getDir(), 'assets/icons/png/1024x1024.png')})
          mainWin.setURL(managerRemote.getDir(),"project.html", {key: key, name: name, location: location})
          mainWin.win.setMinimumSize(800,700);
          mainWin.win.webContents.on('did-finish-load', () => {
            mainWin.win.show()
            win.close();
          })
          let content = forklift.App.getPaletteInstance("MAIN").getBox("CONTENTS")
          content.style.display = "none"
    }
    newProject() {

    }
}
class Palette extends forklift.PaletteLoader {
    constructor(id) {
        super(id)
        this.addBox("SIDEBAR", "rb-sidebar", Sidebar)
    }
}
module.exports = Palette