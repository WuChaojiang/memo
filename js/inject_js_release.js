(function (dev) {
    if (!dev) {
        return
    }
    var impl = {
        redefineGetter: function (inst, property, v) {
            var funcimpl = function () {
                return v
            };
            if (inst.__defineGetter__) {
                inst.__defineGetter__(property, funcimpl)
            } else {
                if (Object.defineProperty) {
                    Object.defineProperty(inst, property, {
                        get: funcimpl
                    })
                }
            }
        },
        disableShowDialog: function () {
            var disableFunc = function () {
                return true
            };
            var windowDisableProperty = ["alert", "prompt", "confirm", "showModalDialog", "showModelessDialog"];
            for (var i = 0; i < windowDisableProperty.length; ++i) {
                this.redefineGetter(window, windowDisableProperty[i], disableFunc)
            }
        },
        overrideProperties: function (properties) {
            if (!properties || !properties.length) {
                return
            }
            for (var i = 0; i < properties.length; ++i) {
                var p = properties[i];
                if (!p || !p.instance || !p.property) {
                    continue
                }
                this.redefineGetter(p.instance, p.property, p.value)
            }
        },
        getOverridePropertyDescription: function (inst, property, value) {
            if (!inst || !property) {
                return null
            }
            return {
                instance: inst,
                property: property,
                value: value
            }
        },
        isAndroid: function (dev) {
            var ua = dev.userAgent;
            return !!ua.match(/android/g)
        },
        overrideAndroidSpecal: function (dev) {
            if (!this.isAndroid(dev)) {
                return
            }
            var properties = [];
            properties.push(this.getOverridePropertyDescription(navigator, "getBattery", true));
            properties.push(this.getOverridePropertyDescription(navigator, "vibrate", true));
            properties.push(this.getOverridePropertyDescription(navigator, "hardwareConcurrency", 4));
            this.overrideProperties(properties)
        },
        overridePropertiesByDev: function (dev) {
            var properties = [];
            properties.push(this.getOverridePropertyDescription(navigator, "userAgent", dev.userAgent));
            properties.push(this.getOverridePropertyDescription(navigator, "plugins", {
                length: 0
            }));
            if ("javaEnabled" in dev) {
                properties.push(this.getOverridePropertyDescription(navigator, "javaEnabled", function () {
                    return !!dev.javaEnabled
                }))
            }
            properties.push(this.getOverridePropertyDescription(navigator, "characterSet", undefined));
            properties.push(this.getOverridePropertyDescription(navigator, "browserLanguage", undefined));
            if ("screen" in dev) {
                properties.push(this.getOverridePropertyDescription(window.screen, "width", dev.screen.width));
                properties.push(this.getOverridePropertyDescription(window.screen, "height", dev.screen.height));
                properties.push(this.getOverridePropertyDescription(window.screen, "colorDepth", 32))
            }
            this.overrideProperties(properties);
            if (this.isAndroid(dev)) {
                this.overrideAndroidSpecal(dev)
            }
        },
        mute: function () {
            var obj = this;
            var muteimpl = function () {
                obj.muteByTag("video");
                obj.muteByTag("audio")
            };
            muteimpl();
            setInterval(muteimpl, 5000)
        },
        muteByTag: function (tag) {
            var eles = document.getElementsByTagName(tag);
            if (!eles || eles.length <= 0) {
                return
            }
            for (var i = 0; i < eles.length; ++i) {
                var e = eles[i];
                if (!e.__lookupSetter__) {
                    continue
                }
                if (e.__lookupSetter__("muted")) {
                    e.muted = true
                }
                if (e.__lookupSetter__("volume")) {
                    e.volume = 0
                }
            }
        },
        inject: function (dev) {
            if (window.__tv_fun_toolkits_dolphin_already_injection_) {
                return
            }
            window.__tv_fun_toolkits_dolphin_already_injection_ = true;
            this.disableShowDialog();
            this.overridePropertiesByDev(dev);
            this.mute()
        }
    };
    impl.inject(dev)
})({
    "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_4 like Mac OS X)AppleWebKit/605.1.15 (KHTML, like Gecko)Mobile/15E148",
    "javaEnabled": false,
    "screen": {
        "width": 750,
        "height": 1334
    }
});