'use babel'

import path from 'path'
let cache = {}

const onkeydown = (event) => {
    console.log('@event.keyCode', event.keyCode)
}

const onkeyup = (event) => {
    // TODO: do something
}

const onkeypress = (event) => {
    // TODO: do something
}

export function activate(state) {
    atom.workspace.observeTextEditors((editor) => {
        let editorView = atom.views.getView(editor)
        editorView.addEventListener('keydown', onkeydown)
        editorView.addEventListener('keyup', onkeyup)
        editorView.addEventListener('keypress', onkeypress)
    })
}

export function deactivate() {
    atom.workspace.observeTextEditors((editor) => {
        let editorView = atom.views.getView(editor)
        editorView.removeEventListener('keydown', onkeydown)
        editorView.removeEventListener('keyup', onkeyup)
        editorView.removeEventListener('keypress', onkeypress)
    })
}
