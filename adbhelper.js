const GLib = imports.gi.GLib;

function findDevices() {
    let [res, out, error] = GLib.spawn_sync(null, ["bash", "-c", "adb devices -l | awk 'NR>1 {print $1}'"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);

    if (!isEmpty(error.toString())) {
        return { error: error.toString() };
    }

    if (!isEmpty(out.toString())) {

        let devices = [];

        let array = out.toString().split('\n');

        for (var i = 0; i < array.length; i++) {

            let deviceId = array[i];

            if (!isEmpty(deviceId)) {

                devices.push(getDeviceDetail(deviceId));
            }
        }
        return {
            devices: devices
        }

    } else {
        return { error: "No devices found" }
    }
}

function getDeviceDetail(deviceId) {
    let [res, out, error] = GLib.spawn_sync(null, ["bash", "-c", "adb -s " + deviceId + " shell getprop ro.product.model"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);

    let device;

    if (!isEmpty(error.toString())) {
        return;
    }

    if (!isEmpty(out.toString())) {
        device = { deviceId: deviceId, name: out.toString() }
        return device;
    }
}

/**
 * Get Android version
 */
function getAndroidVersion(deviceId) {
    let [res, out, error] = GLib.spawn_sync(null, ["bash", "-c", "adb -s " + deviceId + " shell getprop ro.build.version.release"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);

    let version;

    if (!isEmpty(error.toString())) {
        return;
    }

    if (!isEmpty(out.toString())) {
        version = { version: out.toString() }
        return version;
    }
}

/**
 * Get screenrecord process pid
 */
function getScreenrecordPid(deviceId) {
    let [res, out, error] = GLib.spawn_sync(null, ["bash", "-c", "adb -s " + deviceId + " shell ps | grep screenrecord | awk '{print $2}'"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    let pid;

    if (!isEmpty(error.toString())) {
        return;
    }

    if (!isEmpty(out.toString())) {
        pid = { pid: out.toString() }
        return pid;
    }
}

//start adb daemon on init
function startDaemon() {
    GLib.spawn_async(null, ["bash", "-c", "adb devices"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
}

function takeScreenshot(deviceId) {
    //current time
    let time = '$(date +%Y-%m-%d-%H:%M:%S)';
    // get Android version
    let version = getAndroidVersion(deviceId).version.trim();

    // reference: http://www.stkent.com/2016/08/28/capturing-Nougat-screenshots-using-adb-shell.html
    // if Nougat (7) use new direct method
    if (version >= 7) {
        GLib.spawn_async(null, ["bash", "-c", "adb -s " + deviceId + " shell screencap -p > ~/Desktop/screen" + time + ".png"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    } else {
        // if lower than Nougat use old method
        GLib.spawn_async(null, ["bash", "-c", "adb -s " + deviceId + " shell screencap -p | sed 's/\r$//' > ~/Desktop/screen" + time + ".png"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
        // in case the image is corrupted comment the line above and uncomment line under
        //GLib.spawn_async(null, ["bash", "-c", "adb -s "+ deviceId +" shell screencap -p | perl -pe 's/\x0D\x0A/\x0A/g' > ~/Desktop/screen"+ time +".png"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    }

}

function recordScreen(deviceId) {
    let time = '$(date +%Y-%m-%d-%H:%M:%S)';
    GLib.spawn_async(null, ["bash", "-c", "adb -s " + deviceId + " shell screenrecord /sdcard/screenrecord.mp4"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);

}

function stopScreenRecording(deviceId) {
    let time = '$(date +%Y-%m-%d-%H:%M:%S)';
    // get PID of the screenrecord process
    let pid = getScreenrecordPid(deviceId).pid.trim();

    GLib.spawn_sync(null, ["bash", "-c", "adb -s " + deviceId + " shell kill -SIGINT " + pid], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    //GLib.spawn_sync(null, ["bash", "-c", "adb -s "+ deviceId +" pull /sdcard/screenrecord.mp4 ~/Desktop/screenrecord-"+ time +".mp4"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    // kill screencrecord causes unexpected end of the video. Sleep 1 gives us 1 s to finish the screenrecord process. Increase if video still corrputed
    GLib.spawn_sync(null, ["bash", "-c", "sleep 1; adb -s " + deviceId + " pull /sdcard/screenrecord.mp4 ~/Desktop/screenrecord-" + time + ".mp4"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
}

function establishTCPConnection(deviceId) {

    let deviceIp = getDeviceIp(deviceId);

    GLib.spawn_sync(null, ["bash", "-c", "adb -s " + deviceId + " tcpip 5555"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    let [res, out, error] = GLib.spawn_sync(null, ["bash", "-c", "adb -s " + deviceId + " connect " + deviceIp + ":5555"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);

    return out.toString().trim();

}

function useUsb() {
    let [res, out, error] = GLib.spawn_async(null, ["bash", "-c", "adb usb"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);

}

function captureBugReport(deviceId) {
    let time = '$(date +%Y-%m-%d-%H:%M:%S)';
    let [res, out, error] = GLib.spawn_async(null, ["bash", "-c", "adb -s " + deviceId + " bugreport > ~/Desktop/bugreport" + time + ".txt"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
}

function getDeviceIp(deviceId) {
    let [res, out, error] = GLib.spawn_sync(null, ["bash", "-c", "adb -s " + deviceId + " shell ip route | awk '{print $9}'"], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    return out.toString().trim();

}


function isEmpty(str) {
    return (!str || str.length === 0 || !str.trim());
}