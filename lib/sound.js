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
        this.soundSetCache = new Map()
        this.soundSet = new Map()
        this.soundSetPackage = {}
        this.EXTENSIONS = ['.wav', '.mp3', '.ogg']
        this.listeners = []
    }

    getDefaultConfig() {
        let basepath = path.join(__dirname, '../soundset/')
        let installedSoundSets = fs.readdirSync(basepath).filter((dirname) => {
            return fs.statSync(path.join(basepath, dirname)).isDirectory()
            // TODO: check soundset package.json
        })
        configSchema.soundSetName.enum = installedSoundSets
        return configSchema
    }

    loadSoundSet() {
        return new Promise((resolve) => {
            this.soundSetPackage = require(path.join(__dirname, '../soundset/', this.soundSetName, 'package.json'))
            if (this.soundSetCache.get(this.soundSetName)) {
                this.soundSet = this.soundSetCache.get(this.soundSetName)
                resolve()
            } else {
                // set audio cache
                recursive(path.join(__dirname, '../soundset/', this.soundSetName, 'audios'), (_, audioPaths) => {
                    let audios = new Map()
                    for (let audioPath of audioPaths) {
                        if (!lodash.contains(this.EXTENSIONS, path.extname(audioPath))) continue
                        audios.set(path.basename(audioPath), new Audio(audioPath))
                    }
                    this.soundSetCache.set(this.soundSetName, audios)

                    this.soundSet = this.soundSetCache.get(this.soundSetName)
                    resolve()
                })
            }
        })
    }

    setListener(definition) {
        switch (definition.type) {
            case 'command':
                this.setCommandListener(definition)
                break
            case 'keydown':
            case 'keyup':
                this.setKeyboardListener(definition)
                break
        }
    }

    setCommandListener(definition) {
        let disposable = atom.keymaps.onDidMatchBinding((event) => {
            if (event.keystrokes === definition.event) {
                this.play(lodash.sample(definition.audios))
            }
        })
        this.listeners.push(disposable)
    }

    setKeyboardListener(definition) {
        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
            let listenerFunc = (event) => {
                if (event.keyCode == definition.event) {
                    this.play(lodash.sample(definition.audios))
                }
            }
            editorView.addEventListener(definition.type, listenerFunc)
            this.listeners.push({
                target: editorView,
                event: definition.type,
                func: listenerFunc
            })
        })
    }

    activate(state) {
        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
        })

        this.configSoundSetNameObserver = atom.config.observe('sound.soundSetName', (soundSetName) => {
            this.soundSetName = soundSetName
            this.loadSoundSet().then(() => {
                for (let definition of this.soundSetPackage.definitions) {
                    this.setListener(definition)
                }
            })
        })

        this.configVolumeObserver = atom.config.observe('sound.volume', (volume) => {
            this.volume = volume
        })

        atom.commands.add('atom-text-editor', 'sound:open-sound-dir', soundCommands.openSoundDirectory)
        atom.commands.add('atom-text-editor', 'sound:volume-up', soundCommands.volumeUp)
        atom.commands.add('atom-text-editor', 'sound:volume-down', soundCommands.volumeDown)
    }

    deactivate(state) {
        while (this.listeners.length) {
            let listener = this.listeners.pop()
            // TODO: check instance of Disposable
            if (lodash.isFunction(listener.dispose)) {
                listener.dispose()
            } else {
                listener.target.removeEventListener(listener.event, listener.func)
            }
        }

        this.configSoundSetNameObserver.dispose()
        this.configVolumeObserver.dispose()
    }

    play(audioFileName) {
        this.soundSet.get(audioFileName).play()
        console.log('@audioFileName', audioFileName)
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
