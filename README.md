# Sound package for Atom editor

Play sound on any events...

## Install

`apm install sound`

## Custom sound set

You can add custom sound by putting audio files in sound directory.
`shift-cmd-p` > select `Sound: Open Soundset Dir` and put your sound sets.

### sound set directory structures

```
soundset $ tree
.
└── Click(Your sound set directory)
    ├── audios(audio files)
    └── package.json(soundset definition file)
```

### sound set definition file

The definition file is named `package.json` and put it top of sound set directory.

+ `name`: sound set name.
+ `description`: sound set descriptions.
+ `deminitions(array of object)`: sound definitions.
  + `type`: event type.
  + `events(object)`: audio trigger name (key) and array of audio file names (value). multiple audios are played randomly.

default custom sound set file.
```js
{
    "name": "Click",
    "description": "Click Knock Tap...",
    "definitions": [
        {
            "type": "keydown",
            "events": {
                "13": ["pr_buzzer.wav"],
                "default": [
                    "step_1.wav",
                    "step_2.wav",
                    "step_4.wav",
                    "step_5.wav",
                    "step_6.wav"
                ]
            }
        },
        {
            "type": "keystroke",
            "events": {
                "ctrl-a": ["gender_rl.wav"],
                "ctrl-e": ["gender_lr.wav"]
            }
        },
        {
            "type": "command",
            "events": {
                "core:save": ["step_3.wav"]
            }
        }
    ]
}
```

#### definitions

##### keydown and keyup types

Those event definitions were triggered when keyboard pressed (keydown) or released (keyup).

+ `(keycode number)`: triggered when exact key pressed or released. ex) 13: Enter, 9: Tab, 17: Ctrl
+ `default`: if triggered key not defined in definition, this audios selected.

key codes: [KeyboardEvent.keyCode - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)

##### keystroke type

This event definition was triggered when keyboard shortcut executed.

+ `ctrl-a`
+ `ctrl-e`
+ and more shortcuts: open your settings of Keybindings!

##### command type

This event definition was triggered when atom editor command executed.

+ `core:save`
+ `core:close`
+ and more commands: open your settings of Keybindings!

### supported audio file types

+ `.mp3`
+ `.wav`
+ `.ogg`

## TODO

+ [x] sound playing
+ [ ] shortcuts
+ [x] more events
+ [x] custom sound sets
+ [x] per key code sound
+ [ ] `install soundset` command
+ [x] volume
+ [ ] sound throttling

## Similar projects

+ [surdu/typewriter-sounds](https://github.com/surdu/typewriter-sounds)
+ [remanc/mechanical-keyboard](https://github.com/remanc/mechanical-keyboard)
+ [darklight721/keyboard-sounds](https://github.com/darklight721/keyboard-sounds)
+ [airtoxin/Sublime-Sound](https://github.com/airtoxin/Sublime-Sound)

## License

MIT
