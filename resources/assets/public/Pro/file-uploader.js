export default function ($, $form, form, fluentFormVars, formSelector) {
    /**
     * Register file uploaders
     * @return {void}
     */
    var initUploader = function () {

        if (!jQuery.fn.fileupload) {
            return;
        }

        $form.find('input[type="file"]').each(function (key, el) {
            var element = $(this),
                uploadedList;

            // Set files thumbnail list container
            uploadedList = $('<div/>', {
                class: 'ff-uploaded-list',
                style: 'font-size:12px; margin-top: 15px;'
            });
            element.closest('div').append(uploadedList);
            // original width for preview filename ellipsis
            const maxWidth = uploadedList.width();

            // Set maximum allowed files count protection
            var rules = form.rules[element.prop('name')];
            var maxFiles = rules['max_file_count']['value'];

            if ('max_file_count' in rules) {
                rules['max_file_count']['remaining'] = Number(maxFiles);
            }

            // Set html accept property for file types
            var acceptedFileTypes = '';
            if ('allowed_file_types' in rules) {
                acceptedFileTypes = rules.allowed_file_types.value.join('|');
                element.prop('accept', '.' + acceptedFileTypes.replace(/\|/g, ',.'));
            } else {
                acceptedFileTypes = rules.allowed_image_types.value.join('|');
                if (acceptedFileTypes) {
                    element.prop('accept', '.' + acceptedFileTypes.replace(/\|/g, ',.'));
                } else {
                    element.prop('accept', 'image/*');
                }
            }

            function showUploadError(msg) {
                let elName = element.prop('name');
                $form.trigger('show_element_error', {
                    element: elName,
                    message: msg
                });
            }

            function changeValidation(e, data) {
                if (!data || !data.files || !data.files.length) {
                    return;
                }

                $form.find('.ff-upload-preview-elem').remove();
                // return true;
                if ('max_file_count' in rules) {
                    $(formSelector + '_errors').empty();
                    $(this).closest('div').find('.error').html('');
                    var remaining = rules['max_file_count']['remaining'];
                    if (!remaining || data.files.length > remaining) {
                        var msg = 'Maximum 1 file is allowed!';
                        msg = maxFiles > 1 ? 'Maximum ' + maxFiles + ' files are allowed!' : msg;
                        if (rules.max_file_count && rules.max_file_count.message) {
                            msg = rules.max_file_count.message;
                        }
                        showUploadError(msg);
                        return false;
                    }
                }

                var validationErrors = validateFile(
                    data.files[0], form.rules[element.prop('name')]
                );

                if (validationErrors.length) {
                    showUploadError(validationErrors.join(', '));
                    return false;
                }

                return true;
            }

            function addParameterToURL(param) {
                let _url = fluentFormVars.ajaxUrl;
                _url += (_url.split('?')[1] ? '&' : '?') + param;
                return _url;
            }

            const $el = $(el);

            // Init the uploader
            element.fileupload({
                dataType: 'json',
                dropZone: element.closest('.ff-el-group'),
                url: addParameterToURL('action=fluentform_file_upload&formId=' + form.id),
                change: changeValidation,
                add: function (e, data) {
                    if (!changeValidation(e, data)) {
                        return;
                    }

                    var previewContainer = $('<div/>', {
                        class: 'ff-upload-preview'
                    });
                    data.context = previewContainer;

                    var previewThumb = $('<div/>', {
                        class: 'ff-upload-thumb'
                    });

                    var previewDetails = $('<div/>', {
                        class: 'ff-upload-details'
                    });

                    var thumb = $('<div/>', {
                        class: 'ff-upload-preview-img',
                        style: `background-image: url('${getThumbnail(data.files[0])}');`
                    });

                    var errorInline = $('<div>', {
                        class: 'ff-upload-error',
                        style: 'color:red;'
                    });

                    var fileProgress = $('<span/>', {
                        html: fluentFormVars.upload_start_txt,
                        class: 'ff-upload-progress-inline-text ff-inline-block'
                    });

                    // Set inline progress bar
                    var progressBarInline = $(`
									<div class="ff-upload-progress-inline ff-el-progress">
										<div class="ff-el-progress-bar"></div>
									</div>
								`);

                    var fileName = $('<div/>', {
                        class: 'ff-upload-filename',
                        html: data.files[0].name
                    });

                    var removeBtn = $('<span/>', {
                        'data-href': '#',
                        'data-attachment-id':'',
                        'html': '&times;',
                        'class': 'ff-upload-remove'
                    });

                    var fileSize = $('<div>', {
                        class: 'ff-upload-filesize ff-inline-block',
                        html: getFileSize(data.files[0].size)
                    });

                    previewThumb.append(thumb);
                    previewDetails.append(fileName, progressBarInline, fileProgress, fileSize, errorInline, removeBtn);
                    previewContainer.append(previewThumb, previewDetails);

                    uploadedList.append(previewContainer);

                    // set width for filename container
                    // filename larger than it's container will truncate
                    fileName.css({
                        maxWidth: maxWidth
                            - 91 // width of left image area
                            + 'px'
                    });
                    data.submit();
                    data.context.addClass('ff_uploading');
                },
                progress: function (e, data) {
                    let progress = parseInt(data.loaded / data.total * 100, 10);
                    data.context
                        .find('.ff-el-progress-bar')
                        .css('width', progress + '%');
                    data.context
                        .find('.ff-upload-progress-inline-text')
                        .text(fluentFormVars.uploading_txt);
                },
                done: function (e, data) {
                    data.context.removeClass('ff_uploading');
                    if (data.result && 'data' in data.result && 'files' in data.result.data) {
                        if ('error' in data.result.data.files[0]) {
                            // Error given by WP (wp_handle_upload)
                            showUploadError('Upload Error: ' + data.result.data.files[0].error);
                            data.context.remove();
                        } else {
                            data.context
                                .find('.ff-upload-progress-inline-text')
                                .text(fluentFormVars.upload_completed_txt);

                            rules['max_file_count']['remaining'] -= 1;
                            data.context.attr('data-src', data.result.data.files[0].url);
                            data.context.find('.ff-upload-remove').attr({
                                'data-href': data.result.data.files[0].file,
                                'data-attachment-id': data.result.data.files[0].attachment_id
                            });

                            $form.find('input[name=' + $el.data('name') + ']').trigger('change');
                        }
                    } else {
                        // For debugging purpose to catch devlopment erros,
                        // this check might not be needing in production.
                        let message = 'Sorry! The upload failed for some unknown reason.';

                        if (data.messages) {
                            let keys = Object.keys(data.messages);
                            if (keys.length) {
                                message = data.messages[keys[0]];
                            }
                        }
                        showUploadError(message);
                        data.context.remove();
                    }
                },
                fail: function (e, data) {
                    let errors = [];
                    data.context.remove();
                    if (data.jqXHR.responseJSON && data.jqXHR.responseJSON.errors) {
                        $.each(data.jqXHR.responseJSON.errors, function (key, error) {
                            if (typeof error == 'object') {
                                $.each(error, function (i, msg) {
                                    errors.push(msg);
                                });
                            } else {
                                errors.push(error);
                            }
                        });
                    } else if (data.jqXHR.responseText) {
                        errors.push(data.jqXHR.responseText);
                    } else {
                        errors.push('Something is wrong when uploading the file! Please try again');
                    }
                    showUploadError(errors.join(', '));
                }
            });

            $el.on('change_remaining', function (e, data) {
                rules['max_file_count']['remaining'] += data;
            });

        });
    };

    /**
     * Get thumbnail image for file upload preview
     * @param  {file} file
     * @return {mixed}
     */
    var getThumbnail = function (file) {
        if (!!file.type.match('image')) {
            return URL.createObjectURL(file);
        }

        var canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        canvas.style.zIndex = 8;
        canvas.style.position = "absolute";
        canvas.style.border = "1px solid";

        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fillRect(0, 0, 60, 60);
        ctx.font = "13px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(file.name.substr(file.name.lastIndexOf('.') + 1), 30, 30, 60);
        return canvas.toDataURL();
    };

    /**
     * Get formatted file size to show in preview
     * @param  {int} size
     * @return {string}
     */
    var getFileSize = function returnFileSize(size) {
        if (size < 1024) {
            return size + 'bytes';
        } else if (size >= 1024 && size <= 1048576) {
            return (size / 1024).toFixed(1) + 'KB';
        } else if (size > 1048576) {
            return (size / 1048576).toFixed(1) + 'MB';
        }
    };

    /**
     * Register event handler to delete uploaded file
     * @return {void}
     */
    var registerFileRemove = function () {
        $form.find('.ff-uploaded-list').on('click', '.ff-upload-remove', function (e) {
            e.preventDefault();
            var elFiles,
                $this = $(this),
                parent = $this.closest('.ff-uploaded-list'),
                $el = parent.closest('.ff-el-input--content').find('input[type=file]'),
                filePath = $this.attr('data-href'),
                attachmentId = $this.attr('data-attachment-id');
            if (filePath == '#') {
                $this.closest('.ff-upload-preview').remove();
                if (!parent.find('.ff-upload-preview').length) {
                    parent.siblings('.ff-upload-progress').addClass('ff-hidden');
                }
                $el.trigger('change_remaining', 1);
            } else {
                $.post(fluentFormVars.ajaxUrl, {
                    path: filePath,
                    attachment_id : attachmentId,
                    action: 'fluentform_delete_uploaded_file'
                })
                    .then(function (response) {
                        var element = $this.closest('.ff-el-input--content').find('input');
                        $el.trigger('change_remaining', 1);
                        $this.closest('.ff-upload-preview').remove();
                        if (!parent.find('.ff-upload-preview').length) {
                            parent.siblings('.ff-upload-progress').addClass('ff-hidden');
                        }
                        $el.trigger('change');
                    });
            }
        });
    };

    /**
     * Validate a file before uploading
     * @param  {file}
     * @return {array}
     */
    var validateFile = function (file, rules) {
        // return [];
        var validationErrors = [];

        // Accepted file types validation
        var fileTypes = '';
        var fileTypesMessage = '';
        if ('allowed_file_types' in rules) {
            fileTypes = rules['allowed_file_types']['value'];
            fileTypesMessage = rules['allowed_file_types']['message'];
        } else if ('allowed_image_types' in rules) {
            fileTypes = rules['allowed_image_types']['value'];
            fileTypesMessage = rules['allowed_image_types']['message'];
        }

        if (fileTypes) {
            var acceptFileTypes = new RegExp('(' + fileTypes.join('|') + ')', 'i');
            var fileExt = file['name'].split('.').pop();
            fileExt = fileExt.toLowerCase();
            if (!acceptFileTypes.test(fileExt)) {
                validationErrors.push(fileTypesMessage);
            }
        }

        // Maximum file size validation
        if ('max_file_size' in rules && file['size'] > rules['max_file_size']['value']) {
            validationErrors.push(rules['max_file_size']['message']);
        }

        return validationErrors;
    };


    initUploader();
    registerFileRemove();

    $(document.body).on('fluentform_reset', function () {
        initUploader();
    });
};