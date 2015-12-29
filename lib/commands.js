'use babel'

import path from 'path'
import open from 'open'

export function openSoundDirectory() {
    open(path.join(__dirname, '../soundset/'))
}

export function volumeUp() {
    atom.config.set('sound.volume', atom.config.get('sound.volume') + 0.1)
}

export function volumeDown() {
    atom.config.set('sound.volume', atom.config.get('sound.volume') - 0.1)
}
