import { Scene3D } from '/js/scene'
import { DebugPanel } from './js/debugPanel'

const devMode = true
const debugPanel = new DebugPanel()

const scene = new Scene3D()
await scene.initAsync()

if (devMode) {
  debugPanel.init()
  debugPanel.addCheckbox(
    true,
    'Show global light',
    scene.debugToggleGlobalLight()
  )
}
