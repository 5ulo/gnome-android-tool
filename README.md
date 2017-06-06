# gnome-android-tool
Gnome shell extension for adb tools

- Take screenshot
- Record screen
- Connect over TCP
- Capture bug report

<img src="https://raw.githubusercontent.com/naman14/gnome-android-tool/master/screenshot.png" >

# Installation
## Install from extensions website
- Install extension from https://extensions.gnome.org/extension/1232/android-tool/
  (Waiting for extenaion to be reviewed and approved)

## Install from Git
- Create folder `android-tool@naman14.github.com` in `~/.local/share/gnome-shell/extensions`
- Clone this repository and copy the contents to the above created folder
- Restart the shell (Alt + F2 and then 'r' command)

- Make sure adb is added in path and bash is available

## Changes
- Android 7.x - native screencap
- Android <7 - old trimming method with sed (optional alternative perl method)
- changed timestamp to show also seconds
- screenrecord is now killed more securelly and before copying file to computer there's a little timeout (`sleep 1`) so the kill process can end safely

## Todo
- Better support for screen capturing - the kill screenrecord process is a bit buggy and makes videos corrupted
```
$ ffmpeg -i
screenrecord-2017-06-06-15:22:39.mp4: Protocol not found
Did you mean file:screenrecord-2017-06-06-15:22:39.mp4?
```

