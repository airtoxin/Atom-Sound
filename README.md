# Sound package for Atom editor

Play sound on keypress etc...

## Install

`apm install sound`

## Custom sound set

You can add custom sound by putting audio files in sound directory.
Directory structures are

[sound] > `Name of SoundSet` > `event directories` > [audio files]

### event directories

+ `keydown`: triggered when keyboard key pressed.
  + `keydown/default`: triggered when missing keycode sound.
  + `keydown/keycode`: triggered when `keycode` key pressed.
+ `keyup`: triggered when keyboard key released.
  + `keydown/default`: triggered when missing keycode sound.
  + `keydown/keycode`: triggered when `keycode` key released.

### key code examples

+ `13`: enter key
+ `9`: tab key
+ `17`: ctrl key

more: [KeyboardEvent.keyCode - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)

### supported audio file types

+ `.mp3`
+ `.wav`
+ `.ogg`

## TODO

+ [x] sound playing
+ [ ] shortcuts
+ [ ] more events
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
