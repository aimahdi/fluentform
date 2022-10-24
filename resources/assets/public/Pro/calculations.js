export const mexpToken = [
    {
        type: 8,
        token: 'round',
        show: 'round',
        value: function (value, decimals = 0) {
            if (!decimals && decimals !== 0) {
                decimals = 2;
            }

            value = parseFloat(value).toFixed(decimals);
            return parseFloat(value);
        }
    },
    {
        type: 0,
        token: 'ceil',
        show: 'ceil',
        value: function (a) {
            return Math.ceil(a);
        }
    },
    {
        type: 0,
        token: 'floor',
        show: 'floor',
        value: function (a) {
            return Math.floor(a);
        }
    },
    {
        type: 0,
        token: 'abs',
        show: 'abs',
        value: function (a) {
            return Math.abs(a);
        }
    },
    {
        type: 8,
        token: 'max',
        show: 'max',
        value: function (a, b) {
            if (a > b)
                return a;
            return b;
        }
    },
    {
        type: 8,
        token: 'min',
        show: 'min',
        value: function (a, b) {
            if (a < b)
                return a;
            return b;
        }
    }
];

// polyfill for matchAll
export  function findAll(regexPattern, sourceString) {
    let output = [];
    let match;
    // make sure the pattern has the global flag
    let regexPatternWithGlobal = RegExp(regexPattern, "g")
    while (match = regexPatternWithGlobal.exec(sourceString)) {
        // get rid of the string copy
        delete match.input
        // store the match data
        output.push(match)
    }
    return output
}

export function isContain(item, value) {
    return item.indexOf(value) !== -1;
}

export function getName(item, replace) {
    const regx = new RegExp(replace + '|}', 'g');
    return item.replace(regx, '');
}

export default function ($, $theForm) {
    var calculationFields = $theForm.find('.ff_has_formula');

    if (!calculationFields.length) {
        return;
    }

    let repeaterTriggerCache = {};
    let repeaterInputsTriggerCache = {};
    mexp.addToken(mexpToken);

    var doCalculation = function () {
        jQuery.each(calculationFields, (index, field) => {
            var $field = jQuery(field);
            var formula = $field.data('calculation_formula');
            let regEx = /{(.*?)}/g;
            // let matches = [...formula.matchAll(regEx)];
            let matches = findAll(regEx, formula);
            let replaces = {};

            jQuery.each(matches, (index, match) => {
                let itemKey = match[0];
                jQuery.each(['{input.', '{select.', '{checkbox.', '{radio.', '{repeat.', '{payment.'], (prefixIndex, prefix) => {
                    if (isContain(itemKey, prefix)) {
                        let name = getName(itemKey, prefix);
                        let value = 0;
                        if (prefix === '{select.') {
                            value = getSelectFieldValue(name);
                        } else if (prefix === '{checkbox.') {
                            value = getCheckboxValue(name);
                        } else if (prefix === '{radio.') {
                            value = getRadioFieldValue(name);
                        } else if (prefix === '{repeat.') {
                            value = getRepeatFieldValue(name);
                        } else if (prefix === '{payment.') {
                            value = getPaymentFieldValue(name);
                        } else {
                            let $el = $theForm.find('input[name="' + name + '"]');
                            if (isAccessible($el)) {
                                value = window.ff_helper.numericVal($el);
                            }
                        }
                        replaces[itemKey] = value;
                        return false; // to break out of this loop
                    }
                })
            });

            jQuery.each(replaces, (key, value) => {
                if (!value) {
                    value = 0;
                }
                formula = formula.split(key).join(value);
            });
            let calculatedValue = '';
            try {
                formula = formula.replace(/\n/g, "");
                calculatedValue = mexp.eval(formula);
                if (isNaN(calculatedValue)) {
                    calculatedValue = '';
                }
            } catch (error) {
                console.log(error, field);
            }

            if ($field[0].type == 'text') {
                const $fieldDom = $($field);
                const prevValue = $fieldDom.val();

                const formattedValue = window.ff_helper.formatCurrency($fieldDom, calculatedValue);

                $fieldDom.val(formattedValue)
                        .prop('defaultValue', formattedValue);

                if (prevValue == '') {
                    return;
                }

                if (prevValue != formattedValue) {
                    $fieldDom.trigger('change');
                }
            } else {
                $field.text(calculatedValue);
            }
        });
    };

    function isAccessible($el) {
        if ($el.closest('.ff_excluded.has-conditions').length) {
            return false;
        }
        return true;
    }

    function getDataCalcValue(selector) {
        let itemValue = 0;
        let selectedItems = $theForm.find(selector);

        if (selectedItems.closest('.ff_excluded.has-conditions').length) {
            return itemValue;
        }

        $.each(selectedItems, (indexItem, item) => {
            let eachItemValue = $(item).attr('data-calc_value');
            if (eachItemValue && !isNaN(eachItemValue)) {
                itemValue += Number(eachItemValue);
            }
        });
        return itemValue;
    }

    /**
     * Init Calculation input number fild
     */
    var initNumberCalculations = function () {
        $theForm.find(
            'input[type=number],input[data-calc_value],select[data-calc_value],.ff_numeric,.ff_payment_item'
        ).on('change keyup', doCalculation);

        doCalculation();

        $theForm.on('do_calculation', () => {
            doCalculation();
        });

    };
    
    function getRepeatFieldValue(name) {
        let value = 0;
        // We may have column index here
        const splits = name.split('.');
        let indexName = false;
        if (splits.length > 1) {
            name = splits[0];
            indexName = splits[1];
        }
        let $targetTable = $theForm.find('table[data-root_name="' + name + '"]');
        if (!repeaterTriggerCache[name]) {
            repeaterTriggerCache[name] = true;
            $targetTable.on('repeat_change', () => {
                doCalculation();
            });
        }
        if (isAccessible($targetTable)) {
            if (!indexName) {
                value = $targetTable.find('tbody tr').length
            } else {
                const tds = $targetTable.find('tbody tr td:nth-child('+indexName+')');
                $.each(tds, (tdIndex, td) => {
                    const $tdInput = $(td).find(':input');
                    const cacheName = name+'_'+indexName + '_' + $tdInput.attr('id');
                    if (!repeaterInputsTriggerCache[cacheName]) {
                        repeaterInputsTriggerCache[cacheName] = true;
                        $tdInput.on('change', () => {
                            doCalculation();
                        });
                    }
                    let parsedValue = 0;
                    if ($tdInput.attr('type') === 'select') {
                        parsedValue = parseFloat($tdInput.find('option:selected').attr('data-calc_value'));
                    } else if ($tdInput.attr('type') === 'radio') {
                        parsedValue = parseFloat(getRadioFieldValue($tdInput.attr('name')));
                    } else if ($tdInput.attr('type') === 'checkbox') {
                        parsedValue = parseFloat(getCheckboxValue($tdInput.attr('data-name')));
                    }
                    else {
                        parsedValue = parseFloat($tdInput.val());
                    }
                    if(!isNaN(parsedValue)) {
                        value += parsedValue;
                    }
                });
                if (value) {
                    value = value.toFixed(2);
                }
            }
        }
        return value;
    }
    
    function getPaymentFieldValue(name) {
        let value= 0;
        let $elem = $theForm.find(':input[data-name="' + name + '"]');
        if ($elem.length && isAccessible($elem)) {
            let elementType = $elem[0].type;
            if (elementType === 'radio') {
                value = getRadioFieldValue(name, true);
            } else if (elementType === 'hidden') {
                value = $elem.attr('data-payment_value');
            } else if (elementType === 'number' || elementType === 'text') {
                value = window.ff_helper.numericVal($elem);
            } else if (elementType === 'checkbox') {
                value = getCheckboxValue(name, true);
            } else if (elementType === 'select-one') {
                value = getSelectFieldValue(name, true);
            }
        }
        return value
    }
    
    function getRadioFieldValue(name , forPaymentField = false) {
        let value = 0;
        let $el = $theForm.find('input[name="' + name + '"]:checked');
        if (forPaymentField) {
            return $el.attr('data-payment_value');
        }
        if (isAccessible($el)) {
            value = $el.attr('data-calc_value') || 0;
        }
        return value;
    }
    
    function getSelectFieldValue(name, forPaymentField = false) {
        let value = 0;
        if (forPaymentField) {
            return $theForm.find('select[name="' + name + '"] option:selected').data('payment_value');
        }
        value = getDataCalcValue('select[data-name="' + name + '"] option:selected');
        $theForm.find('select[data-name="' + name + '"]').attr('data-calc_value', value);
        return value;
    }
    
    function getCheckboxValue(name, forPaymentField = false) {
        if (!forPaymentField) {
            return getDataCalcValue('input[data-name="' + name + '"]:checked');
        }
        let $elem = $theForm.find(':input[data-name="' + name + '"]');
        let groupId = $elem.data('group_id');
        let groups = $theForm.find('input[data-group_id="' + groupId + '"]:checked');
        let groupTotal = 0;
        groups.each((index, group) => {
            let itemPrice = jQuery(group).data('payment_value');
            if (itemPrice) {
                groupTotal += parseFloat(itemPrice);
            }
        });
        return groupTotal;
    }
    
    initNumberCalculations();
}