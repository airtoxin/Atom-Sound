'use babel'

import fs from 'fs'
import path from 'path'
import recursive from 'recursive-readdir'
import configSchema from './config-schema.json'

class Main {
    constructor() {
        // used for package config
        this.config = this.getDefaultConfig()
    }

    getDefaultConfig() {
        let basepath = path.join(__dirname, '../sound/')
        let installedSoundSets = fs.readdirSync(basepath).filter((dirname) => {
            return fs.statSync(path.join(basepath, dirname)).isDirectory()
        })
        configSchema.soundSetName.enum = installedSoundSets
        return configSchema
    }

    loadSoundSetAsync() {
        let dirpath = path.join(__dirname, '../sound/', this.soundSetName)
        recursive(dirpath, (_, files) => {
            for (let file of files) {
                let fileDir = path.dirname(file)
                let sounds = this.soundSet.get(fileDir) || []
                this.soundSet.set(fileDir, sounds.concat(new Audio(file)))
            }
        })
    }

    activate(state) {
        this.soundSetName = atom.config.get('sound.soundSetName')
        this.soundSet = new Map()
        this.loadSoundSetAsync()

        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
            editorView.addEventListener('keydown', this.onkeydown.bind(this))
            editorView.addEventListener('keyup', this.onkeyup.bind(this))
        })

        this.configObserver = atom.config.observe('sound.soundSetName', (soundSetName) => {
            this.soundSetName = soundSetName
            this.loadSoundSetAsync()
        })
    }

    deactivate(state) {
        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
            editorView.removeEventListener('keydown', this.onkeydown)
            editorView.removeEventListener('keyup', this.onkeyup)
        })

        this.configObserver.dispose()
    }

    choiceSound(sounds) {
        if (!sounds) return {play:()=>{}}
        return sounds[~~(Math.random() * sounds.length)]
    }

    onkeydown(event) {
        const dirpath = path.join(__dirname, '../sound/' + this.soundSetName + '/keydown/default')
        this.choiceSound(this.soundSet.get(dirpath)).play()
    }

    onkeyup(event) {
        const dirpath = path.join(__dirname, '../sound/' + this.soundSetName + '/keyup/default')
        this.choiceSound(this.soundSet.get(dirpath)).play()
    }
}

export default new Main()
