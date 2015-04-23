/*
    A simple, lightweight jQuery plugin for creating sortable tables.
    https://github.com/kylefox/jquery-tablesort
    Modified by Kaleb Fulgham @ SpareFoot - https://github.com/kalebdf/jquery-tablesort
    Version 0.0.5
*/
$(function() {

    var $ = window.jQuery;

    $.tablesort = function ($table, settings) {
        var self = this;
        this.$table = $table;
        this.$thead = this.$table.find('thead');
        this.settings = $.extend({}, $.tablesort.defaults, settings);
        this.$thead.find(this.settings.thSelector).bind('click.tablesort', function() {
            self.sort($(this));
        });
        this.index = null;
        this.$th = null;
        this.direction = null;
    };

    $.tablesort.prototype = {

        sort: function(th, direction) {
            var start = new Date(),
                self = this,
                table = this.$table,
                rows = this.$thead.length > 0 ? table.find('tbody tr') : table.find('tr').has('td'),
                cells = table.find('tr td:nth-of-type(' + (th.index() + 1) + ')'),
                sortBy = th.data("sort-by"),
                sortedMap = [];

            this.index = th.index();

            var unsortedValues = cells.map(function(idx, cell) {
                if (sortBy) {
                    return (typeof sortBy === 'function') ? sortBy($(th), $(cell), self) : sortBy;
                }

                var $val = $(this),
                sortValue = $val.data("sort-value"),
                result,
                textVal,
                convertedNumber;

                // Attempt to convert the sort value as a number
                result = (convertedNumber = +sortValue) || sortValue;
                // 0 is a valid number
                if (convertedNumber === 0) {
                    return 0;
                }
                // If there was a value specified by sort value, return it
                if (result) {
                    return result;
                }

                // Attempt to convert the text in the cell to a number else return it
                textVal = $val.text().toLowerCase().replace(/[$%,\s]/g, '');
                if (textVal.length > 0) {
                    convertedNumber = +textVal;
                    // 0 is a valid number
                    if (convertedNumber === 0) {
                        return 0;
                    }
                }
                result = convertedNumber || textVal;
                return result;
            });
            if (unsortedValues.length === 0) return;

            self.$thead.find(self.settings.thSelector)
                .removeClass(self.settings.asc + ' ' + self.settings.desc);

            if (direction !== 'asc' && direction !== 'desc')
                this.direction = this.direction === 'asc' ? 'desc' : 'asc';
            else
                this.direction = direction;

            direction = this.direction == 'asc' ? 1 : -1;

            self.$table.trigger('tablesort:start', [self]);
            self.log("Sorting by " + this.index + ' ' + this.direction);

            for (var i = 0, length = unsortedValues.length; i < length; i++)
            {
                sortedMap.push({
                    index: i,
                    cell: cells[i],
                    row: rows[i],
                    value: unsortedValues[i]
                });
            }

            sortedMap.sort(function(a, b) {
                if (a.value > b.value) {
                    return 1 * direction;
                } else if (a.value < b.value) {
                    return -1 * direction;
                } else {
                    return 0;
                }
            });

            $.each(sortedMap, function(i, entry) {
                table.append(entry.row);
            });

            th.addClass(self.settings[self.direction]);

            self.log('Sort finished in ' + ((new Date()).getTime() - start.getTime()) + 'ms');
            self.$table.trigger('tablesort:complete', [self]);
        },

        log: function(msg) {
            if(($.tablesort.DEBUG || this.settings.debug) && console && console.log) {
                console.log('[tablesort] ' + msg);
            }
        },

        destroy: function() {
            this.$thead.find(this.settings.thSelector).unbind('click.tablesort');
            this.$table.data('tablesort', null);
            return null;
        }

    };

    $.tablesort.DEBUG = false;

    $.tablesort.defaults = {
        debug: $.tablesort.DEBUG,
        asc: 'sorted ascending',
        desc: 'sorted descending',
        thSelector: 'th:not(.no-sort)'
    };

    $.fn.tablesort = function(settings) {
        var table, sortable, previous;
        return this.each(function() {
            table = $(this);
            previous = table.data('tablesort');
            if(previous) {
                previous.destroy();
            }
            table.data('tablesort', new $.tablesort(table, settings));
        });
    };

});
