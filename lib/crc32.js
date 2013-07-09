/**
 * Calculate CRC32.
 * @param input {string}
 * @return {number}
 */
module.exports = (function () {
	var divisor = 0xEDB88320,

		table = {},

		byteCRC = function (input) {
			var i, tmp;

			if (!table[input]) {
				i = 8;
				tmp = input;

				while (i--) {
					tmp = tmp & 1 ? (tmp >>> 1) ^ divisor : tmp >>> 1;
				}

				table[input] = tmp;
			}

			return table[input];
		};

	return function (input) {
		var len = input.length,
			i = 0,
			crc = -1;

		for (; i < len; ++i) {
			crc = byteCRC((crc ^ input[i]) & 0xFF, divisor) ^ (crc >>> 8);
		}

		return ((crc ^ -1) >>> 0);
	};
}());
