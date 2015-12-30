'use babel'

import fs from 'fs'
import path from 'path'
import lodash from 'lodash'
import recursive from 'recursive-readdir'
import configSchema from './config-schema.json'
import * as soundCommands from './commands'

class Main {
    constructor() {
        // used for package config
        this.config = this.getDefaultConfig()
        this.soundSetName = null
        this.volume = null
        this.soundSet = new Map()
        this.EXTENSIONS = ['.wav', '.mp3', '.ogg']
    }

    getDefaultConfig() {
        let basepath = path.join(__dirname, '../soundset/')
        let installedSoundSets = fs.readdirSync(basepath).filter((dirname) => {
            return fs.statSync(path.join(basepath, dirname)).isDirectory()
        })
        configSchema.soundSetName.enum = installedSoundSets
        return configSchema
    }

    loadSoundSetAsync() {
        let dirpath = path.join(__dirname, '../soundset/', this.soundSetName)
        recursive(dirpath, (_, files) => {
            for (let file of files) {
                if (!lodash.contains(this.EXTENSIONS, path.extname(file))) continue
                let fileDir = path.dirname(file)
                let sounds = this.soundSet.get(fileDir) || []
                let exists = lodash.find(sounds, (s) => {
                    return path.basename(s.src) === path.basename(file)
                })
                if (exists) continue
                this.soundSet.set(fileDir, sounds.concat(new Audio(file)))
            }
        })
    }

    activate(state) {
        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
            editorView.addEventListener('keydown', this.onkeydown.bind(this))
            editorView.addEventListener('keyup', this.onkeyup.bind(this))
        })

        this.configSoundSetNameObserver = atom.config.observe('sound.soundSetName', (soundSetName) => {
            this.soundSetName = soundSetName
            this.loadSoundSetAsync()
        })

        this.configVolumeObserver = atom.config.observe('sound.volume', (volume) => {
            this.volume = volume
        })

        atom.commands.add('atom-text-editor', 'sound:open-sound-dir', soundCommands.openSoundDirectory)
        atom.commands.add('atom-text-editor', 'sound:volume-up', soundCommands.volumeUp)
        atom.commands.add('atom-text-editor', 'sound:volume-down', soundCommands.volumeDown)
    }

    deactivate(state) {
        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
            editorView.removeEventListener('keydown', this.onkeydown)
            editorView.removeEventListener('keyup', this.onkeyup)
        })

        this.configSoundSetNameObserver.dispose()
        this.configVolumeObserver.dispose()
    }

    choiceSound(sounds) {
        if (!sounds) return {play:()=>{}}
        let audio = sounds[~~(Math.random() * sounds.length)]
        audio.volume = this.volume
        return audio
    }

    onkeydown(event) {
        this._play('keydown', event.keyCode)
    }

    onkeyup(event) {
        this._play('keyup', event.keyCode)
    }

    _play(eventName, keyCode='default') {
        let dirpath = path.join(__dirname, '../soundset/', this.soundSetName, eventName, ''+keyCode)
        let sounds = this.soundSet.get(dirpath)
        if (sounds) {
            this.choiceSound(sounds).play()
        } else {
            if (keyCode === 'default') return
            this._play(eventName)
        }
    }
}

export default new Main()
