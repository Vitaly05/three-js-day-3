import { Scene3D } from '/js/scene'
import { DebugPanel } from './js/debugPanel'

const devMode = true
const debugPanel = new DebugPanel()

if (devMode) {
  debugPanel.init()
}

const scene = new Scene3D()
scene.init()
