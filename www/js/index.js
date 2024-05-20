document.addEventListener('deviceready', onDeviceReady, false);

let hasAlerted20 = false;
let hasAlerted100 = false;

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    window.addEventListener("batterystatus", onBatteryStatus, false);
    console.log('jQuery is loaded.');
    alert("test");
            setTimeout(function(){
                let batteryLevel = $('#batteryLevel').text().replace('%', '');
                let isPlugged = $('#isPlugged').text() === 'Yes';
    
                $.ajax({
                    url: 'http://192.168.1.5/transfer.php',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        battery_level: batteryLevel, // Change 'level' to 'battery_level'
                        is_plugged: isPlugged // Change 'isPlugged' to 'is_plugged'
                    }),
                    success: function(response) {
                        console.log('Battery status sent successfully.');
                        
                        // Check if battery level is exactly 20 or 100 and update the database accordingly
                        if (batteryLevel === '20' || batteryLevel === '100') {
                            updateDatabase(batteryLevel);
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('Error sending battery status:', error);
                    }
                });
            },1000)
    // Check if jQuery is loaded
    if (typeof jQuery != 'undefined') {
        
        // jQuery to send the status to the server when the button is clicked
    } else {
        console.log('jQuery is not loaded.');
    }
}

function onBatteryStatus(status) {
    console.log("Battery Level: " + status.level + "%");
    console.log("Is Plugged In: " + (status.isPlugged ? "Yes" : "No"));

    let level = status.level;
    document.getElementById('batteryLevel').textContent = level + '%';
    document.getElementById('isPlugged').textContent = status.isPlugged ? "Yes" : "No";

    if (level <= 20 && !hasAlerted20) {
        showAlert("Battery level is low (20% or below). Please charge your device.");
        hasAlerted20 = true;
    } else if (level > 20 && level < 100) {
        hasAlerted20 = false; // Reset the 20% alert flag if battery level goes above 20%
    }

    if (level === 100 && !hasAlerted100) {
        showAlert("Battery is fully charged (100%).");
        hasAlerted100 = true;
    } else if (level < 100) {
        hasAlerted100 = false; // Reset the 100% alert flag if battery level drops below 100%
    }
}

function showAlert(message) {
    alert(message);
}

function updateDatabase(batteryLevel) {
    // Implement the logic to update the database based on the battery level
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

// Initialize the battery status monitoring
initBattery();
