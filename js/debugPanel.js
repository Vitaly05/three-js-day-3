import GUI from 'lil-gui'

export class DebugPanel {
  init() {
    this.gui = new GUI()
  }
  addCheckbox(defaultValue, name, callback) {
    this.gui
      .add({ checked: defaultValue }, 'checked')
      .name(name)
      .onChange(callback)
  }
}
