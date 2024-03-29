const months = '["' + 'January,February,March,April,May,June,July,August,September,October,November,December'.split(',').join('","') + '"]';
const days = '["' + 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',').join('","') + '"]';
const formats = {
	datetime: 'MMMM d yyyy h:mm a',
	date: 'MMMM d yyyy'
};

const compiledTemplates = {};

/**
 * See http://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html for formatting conventions used
 *
 *Comments indicate the value returned for 3.05 pm on Tuesday 4th February 2014
 */
const formatReplacementsMap = {
	MMMM: 'months[date.getMonth()]', // e.g. February
	MMM: 'months[date.getMonth()].substr(0,3)', // Feb
	MM: 'pad2(date.getMonth() + 1, 2)', // 02
	M: '(date.getMonth() + 1)', // 2
	yyyy: 'date.getFullYear()', // 2014
	yy: '(""+date.getFullYear()).substr(-2, 2)', // 14
	EEEE: 'days[date.getDay()]', // Tuesday
	EEE: 'days[date.getDay()].substr(0,3)', // Tue
	d: 'date.getDate()', // 4
	dd: 'pad2(date.getDate())', // 04
	do: 'ordinal(date.getDate())', // 4th
	m: 'date.getMinutes()', // 5
	mm: 'pad2(date.getMinutes())', // 05
	h: '(((date.getHours() + 11) % 12) + 1)', // 3
	hh: 'pad2(((date.getHours() + 11) % 12) + 1)', // 03
	H: 'date.getHours()', // 15
	HH: 'pad2(date.getHours())', // 15
	a: '(date.getHours() >= 12 ? "pm" : "am")', // pm
	t: '`${(((date.getHours() + 11) % 12) + 1)}'
		+ ':'
		+ '${pad2(date.getMinutes())}'
		+ '${date.getHours() >= 12 ? "pm" : "am"}`' // 3:05pm
};

const inSeconds = {
	minute: 60,
	hour: 60 * 60,
	day: 24 * 60 * 60,
	week: 7 * 24 * 60 * 60,
	month: 60 * 60 * 24 * 30,
	year: 365 * 24 * 60 * 60
};

function compile(format) {
	const tpl = formats[format] || format;

	let funcString = 'var months= ' + months + ', days= ' + days + ';';
	funcString += 'function pad2 (number) {return ("0" + number).slice(-2)}';
	funcString += `function ordinal(number) {
		const suffixes = ["th", "st", "nd", "rd"];
		const v = number % 100;
		return number + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
	}`;
	funcString += 'return "' + tpl.replace(/\\?[a-z]+/ig, function (match) {
		if (match.charAt(0) === '\\') {
			return match.substr(1);
		}
		const replacer = formatReplacementsMap[match];

		return replacer ? '" + ' + replacer + ' + "' : match;
	}) + '"';

	return (compiledTemplates[format] = new Function('date', funcString)); // eslint-disable-line no-new-func
}

const ftDateFormat = {
	toDate: function (date) {
		date = date instanceof Date ? date : new Date(date);
		if (date.toString() !== 'Invalid Date') {
			return date;
		}
	},
	asTodayOrYesterdayOrNothing: function (date) {

		if (!date) {
			return;
		}

		const now = new Date();
		const interval = ftDateFormat.getSecondsBetween(now, date);

		let dateString;

		// If this was less than a day ago
		if (ftDateFormat.isToday(date, now, interval)) {
			dateString = 'today';
		} else if (ftDateFormat.isYesterday(date, now, interval)) {
			dateString = 'yesterday';
		} else {
			dateString = '';
		}

		return dateString;
	},
	format: function (date, dateFormat) {
		dateFormat = dateFormat || 'datetime';
		const tpl = compiledTemplates[dateFormat] || compile(dateFormat);
		date = ftDateFormat.toDate(date);
		return date && tpl(date);
	},
	timeAgo: function (date, interval, options) {

		date = ftDateFormat.toDate(date);
		if (!date) {
			return;
		}

		// Accept an interval argument for backwards compatibility
		if (arguments.length === 2 && typeof interval === 'object') {
			options = interval;
			interval = options.interval;
		}

		// Default the interval option to the time since the given date
		if (!interval) {
			interval = ftDateFormat.getSecondsBetween(new Date(), date);
		}

		// If a limit has been supplied and the interval is longer ago than that limit
		if (options && options.limit > 0 && (!interval || interval > options.limit)) {
			return '';
		}

		const abbreviated = options ? options.abbreviated : false;

		let suffix = interval < 0 ? "from now" : "ago";

		interval = Math.abs(interval);

		if (interval < inSeconds.minute) {
			return `${abbreviated ? interval + 's' : interval + ' seconds'} ${suffix}`;
		} else if (interval < (1.5 * inSeconds.minute)) {
			return `${abbreviated ? '1m' : 'a minute'} ${suffix}`;
		} else if (interval < (59 * inSeconds.minute)) {
			return `${Math.round(interval / inSeconds.minute)}${abbreviated ? 'm' : ' minutes'} ${suffix}`;
		} else if (interval < (1.5 * inSeconds.hour)) {
			return `${abbreviated ? '1h' : 'an hour'} ${suffix}`;
		} else if (interval < 22 * inSeconds.hour) {
			return `${Math.round(interval / inSeconds.hour)}${abbreviated ? 'h' : ' hours'} ${suffix}`;
		} else if (interval < (1.5 * inSeconds.day)) {
			return `${abbreviated ? '1d' : 'a day'} ${suffix}`;
		} else if (interval < 25 * inSeconds.day) {
			return `${Math.round(interval / inSeconds.day)}${abbreviated ? 'd' : ' days'} ${suffix}`;
		} else if (interval < (45 * inSeconds.day)) {
			return `${abbreviated ? '1mth' : 'a month'} ${suffix}`;
		} else if (interval < 345 * inSeconds.day) {
			return `${Math.round(interval / inSeconds.month)}${abbreviated ? 'mth' : ' months'} ${suffix}`;
		} else if (interval < (547 * inSeconds.day)) {
			return `${abbreviated ? '1y' : 'a year'} ${suffix}`;
		} else {
			return `${ Math.max(2, Math.floor(interval / inSeconds.year))}${abbreviated ? 'y' : ' years'} ${suffix}`;
		}
	},
	timeAgoNoSeconds: function (date) {

		if (!date) {
			return;
		}

		const now = new Date();
		const interval = ftDateFormat.getSecondsBetween(now, date);

		// If this was less than a minute ago
		if (interval < 60) {
			return 'Less than a minute ago';
		}
		return ftDateFormat.timeAgo(date);
	},
	ftTime: function (dateObj) {
		const now = new Date();
		const interval = ftDateFormat.getSecondsBetween(now, dateObj);
		let dateString;

		// If the date will occur in the next 5 minutes. This check is to allow for
		// reasonably differences in machine clocks.
		if (ftDateFormat.isNearFuture(interval)) {
			dateString = 'just now';

			// If it's beyond 5 minutes, fall back to printing the whole date, the machine
			// clock could be way out.
		} else if (ftDateFormat.isFarFuture(interval)) {
			dateString = ftDateFormat.format(dateObj, 'date');

			// Relative times for today or within the last 4 hours
		} else if (ftDateFormat.isToday(dateObj, now, interval) || (interval < (4 * inSeconds.hour))) {
			dateString = ftDateFormat.timeAgo(dateObj, interval);

			// 'Yesterday' for dates that occurred yesterday
		} else if (ftDateFormat.isYesterday(dateObj, now, interval)) {
			dateString = 'yesterday';

			// Else print the date
		} else {
			dateString = ftDateFormat.format(dateObj, 'date');
		}

		return dateString;
	},
	getSecondsBetween: function (time, otherTime) {
		return Math.round((time - otherTime) / 1000);
	},
	isNearFuture: function (interval) {
		// If the interval within the next 5 minutes
		return (interval < 0 && interval > -(5 * inSeconds.minute));
	},
	isFarFuture: function (interval) {
		// If the interval is further in the future than 5 minutes
		return interval < -(5 * inSeconds.minute);
	},
	isToday: function (date, now, interval) {
		const within24Hours = interval < inSeconds.day;
		const sameDayOfWeek = now.getDay() === date.getDay();
		return (within24Hours && sameDayOfWeek);
	},
	isYesterday: function (date, now, interval) {
		const within48Hours = interval < 2 * inSeconds.day;
		const consecutiveDaysOfTheWeek = now.getDay() === date.getDay() + 1;
		return (within48Hours && consecutiveDaysOfTheWeek);
	},
	inSeconds
};

module.exports = ftDateFormat;
