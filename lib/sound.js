'use babel'

import path from 'path'
import configSchema from './config-schema.json'

let cache = {}

class Main {
    constructor() {
        // used for package config
        this.config = this.getDefaultConfig()
    }

    deactivate(state) {
        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
            editorView.removeEventListener('keydown', this.onkeydown)
            editorView.removeEventListener('keyup', this.onkeyup)
            editorView.removeEventListener('keypress', this.onkeypress)
        })
    }

    activate(state) {
        atom.workspace.observeTextEditors((editor) => {
            let editorView = atom.views.getView(editor)
            editorView.addEventListener('keydown', this.onkeydown)
            editorView.addEventListener('keyup', this.onkeyup)
            editorView.addEventListener('keypress', this.onkeypress)
        })
    }

    getDefaultConfig() {
        return configSchema
    }

    onkeydown(event) {
        let c = atom.config.get('sound.enableThing')
        console.log('@c', c)
        console.log('@event.keyCode', event.keyCode)
    }

    onkeyup(event) {
        // TODO: do something
    }

    onkeypress(event) {
        // TODO: do something
    }
}

export default new Main()
