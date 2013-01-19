exports.constants = {
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

exports.pad = function(num) {
  return (num < 10) ? '0' + num : num.toString();
};

exports.transforms = {};

exports.transforms.date = {
  serialize: function(date) {
    if (date == undefined) {
      return undefined;
    }

    if (!(date instanceof Date)) {
      return null;
    }

    var utcYear = date.getUTCFullYear(),
        month = exports.constants.months[date.getUTCMonth()],
        dayOfMonth = exports.pad(date.getUTCDate()),
        dayOfWeek = exports.constants.days[date.getUTCDay()],
        utcHours = exports.pad(date.getUTCHours()),
        utcMinutes = exports.pad(date.getUTCMinutes()),
        utcSeconds = exports.pad(date.getUTCSeconds());

    return dayOfWeek + ', '
         + dayOfMonth + ' '
         + month + ' '
         + utcYear + ' '
         + utcHours + ':'
         + utcMinutes + ':'
         + utcSeconds + ' GMT';
  }
};

exports.transforms.array = {
  serialize: function(array) {
    if (!(array instanceof Array)) {
      array = [];
    }

    try {
      return JSON.stringify(array);
    } catch(e) {
      return '[]';
    }
  },

  deserialize: function(string) {
    var array;

    try {
      array = JSON.parse(serialized);
    } catch(e) {
      array = null;
    };

    return (array instanceof Array) ? array : [];
  },
};

exports.transforms.number = {
  serialize: function(number) { return number.toString(); },
  deserialize: function(string) { return parseInt(string, 10); }
};

exports.transforms.string = {
  serialize: function(nonString) { return nonString.toString(); },
  deserialize: function(string) { return string; }
};
