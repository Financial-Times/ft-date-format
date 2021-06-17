# ft-date-format

ft-date-format provides javascript utilities for formatting and updating dates in FT style.

  - [Usage](#usage)
    - [JavaScript](#javascript)
  - [Migration Guide](#migration-guide)
  - [Contact](#contact)
  - [Licence](#licence)

## Usage

### JavaScript

#### ft-date-format#format(date, tpl)

Returns a date formatted as a string

  * `date`: A javascript `Date` object or a valid string to pass to the `Date` constructor
  * `tpl`: A string specifying what format to output the date in:
    - `'datetime'`: formats the date in the standard FT long format, including the time. E.g. `May 15, 2014 8:10 am`
    - `'date'`: formats the date in the standard FT long format. E.g. `May 15, 2014`
    - Any other string using [widespread conventions](http://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html) for time/date placeholders, which will be replaced with values extracted from the date provided. See `./main.js` for an up to date list of supported formats. To avoid e.g. the `mm` in `common` being replaced with the month prefix with a double backslash `co\\mmon` i.e. *In most cases custom date formats should not be used, in favour of the standard FT date and datetime formats*

#### ft-date-format#timeAgo(date)

Returns the relative time since the given date, formatted as a human readable string e.g. `13 minutes ago`.

#### ft-date-format#ftTime(date)

Returns relative time or timestamp for a given date, in accordance with FT date formatting conventions.

  * `date`: A javascript `Date` object or a valid string to pass to the `Date` constructor

#### ft-date-format#asTodayOrYesterdayOrNothing(date)

Returns `'yesterday'`, `'today'` or `''` for a given date. You can request this formatting for `ft-date-format` components by adding `data-ft-date-format-format="today-or-yesterday-or-nothing"`.

  * `date`: A javascript `Date` object or a valid string to pass to the `Date` constructor

***

## Migration Guide

State | Major Version | Last Minor Release | Migration guide |
:---: | :---: | :---: | :---:
✨ active | 2 | N/A | [migrate to v2](MIGRATION.md#migrating-from-v1-to-v2) |
⚠ maintained | 1 | 1.0.5 | - |

***

## Contact

If you have any questions, comments, or need help using ft-date-format, please either [raise an issue](https://github.com/Financial-Times/ft-date-format/issues), visit [#ft-origami](https://financialtimes.slack.com/messages/ft-origami/) or email [Origami Support](mailto:origami-support@ft.com).

***

## Licence

This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).
