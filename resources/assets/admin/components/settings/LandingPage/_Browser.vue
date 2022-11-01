<template>
    <div class="ff_browser">
        <div class="fcc_design_preview">
            <div :class="'ffc_browser_' + device_type" class="browser-frame">
                <div class="browser-controls">
                    <div class="window-controls">
                        <span class="close"></span>
                        <span class="minimise"></span>
                        <span class="maximise"></span>
                    </div>
                    <div class="page-controls">
                        <span class="white-container dashicons dashicons-arrow-left-alt2"></span>
                        <span class="white-container dashicons dashicons-arrow-right-alt2"></span>
                    </div>
                    <span class="url-bar white-container">
                        {{ preview_url }}
                    </span>
                </div>
                <div style="min-height: 600px;" v-loading="loading_iframe" id="fcc_iframe_holder"></div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <el-switch
                        v-model="device_type"
                        active-value="desktop"
                        inactive-value="mobile"
                        active-text="Desktop"
                        inactive-text="Mobile">
                </el-switch>
            </div>
        </div>
    </div>
</template>
<script type="text/babel">
    export default {
        name: 'FFBrowserFrame',
        data() {
            return {
                device_type: 'desktop',
                loading_iframe: true,
                frame: null
            }
        },
        watch: {
            'settings.brightness': {
                handler(brightness) {
                    this.brightness(brightness);
                }
            },
            'settings.custom_color': {
                handler(color) {
                    this.backgroundColor(color);
                }
            },
            'settings.media_x_position': {
                handler(x_position) {
                    this.imagePositionCSS(x_position, this.settings.media_y_position);
                }
            },
            'settings.media_y_position': {
                handler(y_position) {
                    this.imagePositionCSS(this.settings.media_x_position, y_position);
                }
            },
            'settings.title': {
                handler(title) {
                    this.setHeaderTitle(title);
                }
            },
            'settings.description': {
                handler(description) {
                    this.setHeaderDescription(description);
                }
            },
            'settings.logo': {
                handler(logo) {
                    this.setHeaderLogo(logo);
                }
            }
        },
        props: ['settings', 'preview_url'],
        methods: {
            initIframe() {
                const that = this;
                this.iframe = jQuery('<iframe/>', {
                    id: 'fcc_design_preview',
                    src: this.preview_url,
                    style: 'display:none;width:100%;height:600px',
                    class: 'landing-page-settings',
                    load: function () {
                        const frame = jQuery(this);
                        frame.show();
                        that.iframe?.contents().find("body").addClass('landing-page-settings-iframe');
                        that.loading_iframe = false;
                    }
                });

                jQuery('#fcc_iframe_holder').html(this.iframe);
            },
            backgroundColor(color) {
                this.iframe?.contents().find(".ff_landing_page_body").attr('style',`background-color: ${color} !important;`);
            },
            brightness(brightness) {
                if (!brightness) {
                    return '';
                }
                let css = '';
                if (brightness > 0) {
                    css += 'contrast(' + ((100 - brightness) / 100).toFixed(2) + ') ';
                }
                css += 'brightness(' + (1 + brightness / 100) + ')';
                this.iframe?.contents().find(".fcc_block_media_attachment").attr('style',`filter:${css} !important;`);
            },
            imagePositionCSS(media_x_position, media_y_position) {
                if (this.settings.layout === 'media_right_full' || this.settings.layout === 'media_left_full') {
                    this.iframe?.contents().find(".ff_landing_media_holder .fc_image_holder img").attr('style',`object-position: ${media_x_position}% ${media_y_position}%!important;`);
                }
            },
            setHeaderTitle(title) {
                const $body = this.iframe?.contents().find('body');
                if (!title) {
                    $body.find('.ff_landing_form .ff_landing_header h1').remove();
                    return;
                }
                if (!$body.find('.ff_landing_form .ff_landing_header').length) {
                    $body.find('.ff_landing_form').prepend(`<div class='ff_landing_header'><h1>${title}</h1></div>`);
                } else {
                    if (!$body.find('.ff_landing_form .ff_landing_header h1').length) {
                        if ($body.find('.ff_landing_form .ff_landing_header .ff_landing_desc').length) {
                            $body.find('.ff_landing_form .ff_landing_header .ff_landing_desc').before(`<h1>${title}</h1>`);
                        } else {
                            $body.find('.ff_landing_form .ff_landing_header').append(`<h1>${title}</h1>`);
                        }
                    } else {
                        $body.find('.ff_landing_form .ff_landing_header h1').text(title);
                    }
                }
            },
            setHeaderDescription(html) {
                const $body = this.iframe?.contents().find('body');
                if (!html) {
                    $body.find('.ff_landing_form .ff_landing_header .ff_landing_desc').remove();
                    return;
                }
                if (!$body.find('.ff_landing_form .ff_landing_header').length) {
                    $body.find('.ff_landing_form').prepend(`<div class='ff_landing_header'><div class="ff_landing_desc">${html}</div></div>`);
                } else {
                    if (!$body.find('.ff_landing_form .ff_landing_header .ff_landing_desc').length) {
                        $body.find('.ff_landing_form .ff_landing_header').append(`<div class="ff_landing_desc">${html}</div>`);
                    } else {
                        $body.find('.ff_landing_form .ff_landing_header .ff_landing_desc').html(html);
                    }
                }
            },
            setHeaderLogo(logo) {
                const $body = this.iframe?.contents().find('body');
                if (!logo) {
                    $body.find('.ff_landing_form .ff_landing_header .ff_landing-custom-logo').remove();
                    return;
                }
                if (!$body.find('.ff_landing_form .ff_landing_header').length) {
                    $body.find('.ff_landing_form').prepend(`<div class='ff_landing_header'><div class="ff_landing-custom-logo"><img src="${logo}" alt="Form Logo"></div></div>`);
                } else {
                    if (!$body.find('.ff_landing_form .ff_landing_header .ff_landing-custom-logo').length) {
                        $body.find('.ff_landing_form .ff_landing_header').prepend(`<div class="ff_landing-custom-logo"><img src="${logo}" alt="Form Logo"></div>`);
                    } else {
                        $body.find('.ff_landing_form .ff_landing_header .ff_landing-custom-logo img').attr('src', logo);
                    }

                }
            }
        },
        mounted() {
            this.initIframe();
        }
    }
</script>
