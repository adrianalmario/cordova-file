document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);

    // Enable background mode
    cordova.plugins.backgroundMode.enable();

    // Configure the notification text
    cordova.plugins.backgroundMode.setDefaults({
        title: 'My App',
        text: 'Running in background',
        icon: 'icon', // This will look for icon.png in platforms/android/res/drawable
        color: 'F14F4D', // Hex format like 'F14F4D'
        resume: true, // The app will come to foreground when tapping on the notification
        hidden: false, // Make the notification visible
        bigText: false // Show the big text style (if available)
    });

    // Listen for activation of the background mode
    cordova.plugins.backgroundMode.on('activate', function() {
        console.log('Background mode activated');
        cordova.plugins.backgroundMode.disableWebViewOptimizations();
    });

    // Listen for deactivation of the background mode
    cordova.plugins.backgroundMode.on('deactivate', function() {
        console.log('Background mode deactivated');
    });

    window.addEventListener("batterystatus", onBatteryStatus, false);

    setInterval(function() {
        let batteryLevel = $('#batteryLevel').text().replace('%', '');
        let isPlugged = $('#isPlugged').text() === 'Yes';
        var payload = {
            battery_level: batteryLevel,
            is_plugged: isPlugged
        };
        console.log(payload);
        $.ajax({
            url: 'https://192.168.5.235:443/transfer.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(response) {
                console.log('Battery status sent successfully.');

                if (batteryLevel === '20' || batteryLevel === '100') {
                    updateDatabase(batteryLevel);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error sending battery status:', error);
            }
        });
    }, 60000); // 60000 milliseconds = 1 minute

    if (typeof jQuery !== 'undefined') {
        console.log('jQuery is loaded.');
    } else {
        console.log('jQuery is not loaded.');
    }

    initBattery();
}

function onBatteryStatus(status) {
    console.log("Battery Level: " + status.level + "%");
    console.log("Is Plugged In: " + (status.isPlugged ? "Yes" : "No"));

    $('#batteryLevel').text(status.level + '%');
    $('#isPlugged').text(status.isPlugged ? "Yes" : "No");

    if (status.level <= 20 && !hasAlerted20) {
        showAlert("Battery level is low (20% or below). Please charge your device.");
        hasAlerted20 = true;
    } else if (status.level > 20 && status.level < 100) {
        hasAlerted20 = false;
    }

    if (status.level === 100 && !hasAlerted100) {
        showAlert("Battery is fully charged (100%).");
        hasAlerted100 = true;
    } else if (status.level < 100) {
        hasAlerted100 = false;
    }
}

function showAlert(message) {
    alert(message);
}

function updateDatabase(batteryLevel) {
    console.log('Update database with battery level: ' + batteryLevel);
}

function initBattery() {
    const batteryLiquid = document.querySelector('.battery__liquid'),
          batteryStatus = document.querySelector('.battery__status'),
          batteryPercentage = document.querySelector('.battery__percentage');

    navigator.getBattery().then((batt) => {
        const updateBattery = () => {
            let level = Math.floor(batt.level * 100);
            batteryPercentage.innerHTML = level + '%';

            if (level >= 51 && level <= 58) {
                batteryPercentage.innerHTML = (level + 1) + '%';
            }

            batteryLiquid.style.height = `${level}%`;

            if (level == 100) {
                batteryStatus.innerHTML = `Full battery <i class="ri-battery-2-fill green-color"></i>`;
                batteryLiquid.style.height = '103%'; 
            } else if (level <= 20 && !batt.charging) {
                batteryStatus.innerHTML = `Low battery <i class="ri-plug-line animated-red"></i>`;
            } else {
                batteryStatus.innerHTML = '';
            }

            batteryPercentage.style.color = level <= 20 ? 'red' : level <= 73 ? 'orange' : 'green';

            if (level <= 20) {
                batteryLiquid.classList.add('gradient-color-red');
                batteryLiquid.classList.remove('gradient-color-orange', 'gradient-color-yellow', 'gradient-color-green');
            } else if (level <= 40) {
                batteryLiquid.classList.add('gradient-color-orange');
                batteryLiquid.classList.remove('gradient-color-red', 'gradient-color-yellow', 'gradient-color-green');
            } else if (level <= 80) {
                batteryLiquid.classList.add('gradient-color-yellow');
                batteryLiquid.classList.remove('gradient-color-red', 'gradient-color-orange', 'gradient-color-green');
            } else {
                batteryLiquid.classList.add('gradient-color-green');
                batteryLiquid.classList.remove('gradient-color-red', 'gradient-color-orange', 'gradient-color-yellow');
            }
        };
        updateBattery();

        batt.addEventListener('chargingchange', updateBattery);
        batt.addEventListener('levelchange', updateBattery);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initBattery();
});
