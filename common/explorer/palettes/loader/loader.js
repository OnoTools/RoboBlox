class Loader extends forklift.PaletteBox {
    constructor(e) {
        super(e)
        this.loadBox("elements/rb-loader/Loader.shadow.html")
        this.loadContent("elements/rb-Loader/Loader.html")
    }
}
class Palette extends forklift.PaletteLoader {
    constructor(id) {
        super(id)
        this.addBox("LOADER", "rb-loader", Loader)
    }
}
module.exports = Palette