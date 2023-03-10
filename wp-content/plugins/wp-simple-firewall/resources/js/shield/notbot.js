if (typeof Shield_Antibot === typeof undefined && typeof shield_vars_notbotjs !== typeof undefined) {
    let Shield_Antibot = new function() {
        let request_count = 0;
        let can_send_request = true;
        let nonce_cook = '';
        let ajaxurl = shield_vars_notbotjs.ajax.not_bot.ajaxurl;
        let use_fetch = typeof fetch !== typeof undefined;
        this.initialise = function() {
            delete shield_vars_notbotjs.ajax.not_bot.ajaxurl;
            nonce_cook = getCookie('shield-notbot-nonce');
            if (typeof nonce_cook !== typeof undefined && nonce_cook.length > 0) {
                shield_vars_notbotjs.ajax.not_bot.exec_nonce = nonce_cook;
            }
            if (shield_vars_notbotjs.flags.run) {
                fire();
            }
        };
        let fire = function() {
            if (can_send_request && request_count < 10) {
                let current = getCookie('icwp-wpsf-notbot');
                if (current === undefined || typeof(current) === 'undefined') {
                    sendReq();
                }
            }
            window.setTimeout(fire, 60000);
        };
        let sendReq = function() {
            request_count++;
            if (use_fetch) {
                return notBotSendReqWithFetch();
            }
            let xhr = new XMLHttpRequest();
            xhr.open("POST", ajaxurl, true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    let rawResp = xhr.response;
                    if (rawResp != null && rawResp !== '' && rawResp.charAt(0) === '{') {
                        let resp = JSON.parse(rawResp)
                        can_send_request = resp && resp.success;
                        if (!can_send_request) {
                            console.log(xhr.response);
                        }
                    }
                } else {
                    can_send_request = false;
                }
            }
            xhr.send((new URLSearchParams(shield_vars_notbotjs.ajax.not_bot)).toString());
        };
        async function notBotSendReqWithFetch() {
            try {
                fetch(ajaxurl, {
                    method: 'POST',
                    body: (new URLSearchParams(shield_vars_notbotjs.ajax.not_bot)).toString(),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                }).then(response => response.json()).then(response_data => {
                    if (response_data) {
                        can_send_request = response_data && response_data.success;
                    } else {
                        use_fetch = false;
                    }
                    return response_data;
                }).catch(error => {
                    console.log(error);
                    use_fetch = false;
                });
            } catch (error) {
                use_fetch = false;
                console.log(error);
            }
        }
        let getCookie = function(name) {
            let value = "; " + document.cookie;
            let parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop().split(";").shift();
        };
    }();
    Shield_Antibot.initialise();
}