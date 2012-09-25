// Toolbox

// This is the same date serializer that Ember.js uses.
exports.dateToString = function(date) {
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var pad = function(num) {
    return num < 10 ? "0" + num : "" + num;
  };

  var utcYear       = date.getUTCFullYear(),
      utcMonth      = date.getUTCMonth(),
      utcDayOfMonth = date.getUTCDate(),
      utcDay        = date.getUTCDay(),
      utcHours      = date.getUTCHours(),
      utcMinutes    = date.getUTCMinutes(),
      utcSeconds    = date.getUTCSeconds();

  var dayOfWeek = days[utcDay];
  var dayOfMonth = pad(utcDayOfMonth);
  var month = months[utcMonth];

  return dayOfWeek + ", " + dayOfMonth + " " + month + " " + utcYear + " " +
         pad(utcHours) + ":" + pad(utcMinutes) + ":" + pad(utcSeconds) + " GMT";
};
