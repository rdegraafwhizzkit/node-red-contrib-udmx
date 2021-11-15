module.exports = function(RED) {

    // Requires
    var glob = require('glob');
    var fs = require('fs');
    var path = require('path');
    var serialport = require('serialport');

//    var hardware_id='403/6001';
//    var id_serial_short='AB0KP25J'; // UDMX dongle
//    var id_serial_short='AQ68GHMS'; // P1 dongle

    // Read the contents of a file to an UTF-8 string
    function get_file_contents(file) {
        return fs.readFileSync(file).toString('utf8');
    }

    // Lookup the device name for given hardware id and serial
    function get_device_name(hardware_id, id_serial_short) {

        for(const file of glob.sync('/sys/bus/usb/devices/*/uevent'))
            if(!file.includes(':'))
                try {
                    folder=path.dirname(file);
                    if(get_file_contents(file).includes('PRODUCT='+hardware_id))
                        if(id_serial_short.toUpperCase()==get_file_contents(folder+'/serial').trim().toUpperCase())
                            for(const file of glob.sync(folder + '/**/uevent'))
                                try {
                                    for(const line of get_file_contents(file).split('\n'))
                                        if(line.includes('DEVNAME') && line.includes('ttyUSB'))
                                            return '/dev/'+line.split('=')[1];
                                } catch(e) {
                                }
                } catch(e) {
                }

        return null;
    }

    // Create the UDMX node
    function UDMXNode(config) {

        RED.nodes.createNode(this, config);
        var node = this;

        node.status({
            text: 'Configuring device',
            shape: 'dot',
            fill: 'yellow'
        });

        device_name=get_device_name(config.hardwareid, config.serial);

        if (device_name != null) {

            node.status({
                text: 'Device found: ' + device_name,
                shape: 'dot',
                fill: 'blue'
            });

            node.on('input', function(msg) {
                try {

                    node.warn('Received input for device: '+device_name);

//                    const port = new SerialPort('/dev/tty-usbserial1', {
//                        baudRate: 57600
//                    })

                    node.status({
                        text: 'Device processed message',
                        shape: 'dot',
                        fill: 'green'
                    });
                } catch (e) {
                    node.status({
                        text: 'Error occurred: ' + e.message,
                        shape: 'ring',
                        fill: 'red'
                    });
                }
            });

        } else {
            node.status({
                text: 'Could not find device',
                shape: 'ring',
                fill: 'red'
            });
        }
    }

    RED.nodes.registerType("udmx", UDMXNode);
};