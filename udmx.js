module.exports = function(RED) {
	var usb = require('usb');

	function UDMXNode(config) {
		RED.nodes.createNode(this, config);
                this.status({text:'not found', shape:'ring', fill:'red'});
		var udev = usb.findByIds(0x0403, 0x6001);
		udev.open();
		var node = this;
		node.status({text:'connected', shape:'dot', fill:'green'});
		node.on('input', function(msg) {

			var channel = Number(msg.topic);
			var level = Number(msg.payload);
			var buf = Buffer(0);
			udev.controlTransfer(64, 1, level, channel-1, buf, function(err, result) {
				if (err) {
					node.error(err);
			                this.status({text:'error', shape:'ring', fill:'red'});
				} else {
					node.status({text:'ch'+('00'+channel).substr(-3)+':'+('00'+level).substr(-3), shape:'dot', fill:'green'});
				}
			});
		});
	}

	RED.nodes.registerType("udmx", UDMXNode);
};
