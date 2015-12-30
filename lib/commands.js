'use babel'

import path from 'path'
import open from 'open'

export function openSoundsetDirectory() {
    open(path.join(__dirname, '../soundset/'))
}

export function volumeUp() {
    atom.config.set('sound.volume', atom.config.get('sound.volume') + 0.1)
}

export function volumeDown() {
    atom.config.set('sound.volume', atom.config.get('sound.volume') - 0.1)
}
