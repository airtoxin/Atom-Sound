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

        atom.commands.add('atom-text-editor', 'sound:open-soundset-dir', soundCommands.openSoundsetDirectory)
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

    setListener(definition) {
        switch (definition.type) {
            case 'keystroke':
                this.setKeystrokeListener(definition)
                break
            case 'command':
                this.setCommandListener(definition)
                break
            case 'keydown':
            case 'keyup':
                this.setKeyboardListener(definition)
                break
        }
    }

    setKeystrokeListener(definition) {
        atom.keymaps.onDidMatchBinding((event) => {
            let eventDefinitionAudios = definition.events[event.keystrokes]
            if (eventDefinitionAudios) {
                this.play(lodash.sample(eventDefinitionAudios))
            }
        })
    }

    setCommandListener(definition) {
        atom.keymaps.onDidMatchBinding((event) => {
            let eventDefinitionAudios = definition.events[event.binding.command]
            if (eventDefinitionAudios) {
                this.play(lodash.sample(eventDefinitionAudios))
            }
        })
    }

    setKeyboardListener(definition) {
        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
            let listenerFunc = (event) => {
                let eventDefinitionAudios = definition.events[event.keyCode]
                if (eventDefinitionAudios) {
                    this.play(lodash.sample(eventDefinitionAudios))
                } else {
                    let defaultEventDefinitionAudios = definition.events['default']
                    if (defaultEventDefinitionAudios) {
                        this.play(lodash.sample(defaultEventDefinitionAudios))
                    }
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

    play(audioFileName) {
        let audio = this.soundSet.get(audioFileName)
        audio.volume = this.volume
        audio.play()
    }
}

export default new Main()
