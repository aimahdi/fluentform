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
            settings: {
                handler(settings) {
                    this.generateCss(settings);
                },
                deep: true
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
                        //  that.generateCss(that.design_settings);
                        const css = `@media screen and (max-width: 1023px) { .ff_landing_page_body .ff_landing_layout_media_right, .ff_landing_layout_media_left {align-items: center; overflow: hidden; flex-direction: row; height: 100%;}} @media screen and (max-width: 600px) { .ff_landing_page_body .ff_landing_layout_media_right, .ff_landing_layout_media_left {padding: 0; height: auto; align-items: flex-start; flex-direction: column-reverse;}}`;

                        that.pushCSS(css);
                        that.loading_iframe = false;
                    }
                });

                jQuery('#fcc_iframe_holder').html(this.iframe);
            },
            generateCss(settings) {
                let css = '';
                let prefix = '.ff_landing_wrapper';
                css += `.ff_landing_page_body { background-color: ${settings.custom_color} !important; }`;
                css += this.brightness(settings);
                css += this.imagePositionCSS(settings);

                this.pushCSS(css);
            },
            brightness(settings) {
                const setValue = settings.brightness;
                if (!setValue) {
                    return '';
                }
                let css = '';
                if (setValue > 0) {
                    css += 'contrast(' + ((100 - setValue) / 100).toFixed(2) + ') ';
                }
                css += 'brightness(' + (1 + settings.brightness / 100) + ')';
                return `.ff_conv_media_holder .fcc_block_media_attachment {filter: ${css}!important;})`;

            },
            imagePositionCSS(settings) {
                if (settings.layout == 'media_right_full' || settings.layout == 'media_left_full') {
                    return `.ff_conv_media_holder .fc_image_holder img {object-position: ${settings.media_x_position}% ${settings.media_y_position}%!important;}`;
                }
                return '';
            },
            pushCSS(css) {
                if (this.iframe) {
                    this.iframe.contents().find('head').find('#ff_landing_page_settings').html(css);
                }
            }
        },
        mounted() {
            this.initIframe();
        }
    }
</script>
