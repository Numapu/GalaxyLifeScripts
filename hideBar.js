/*
 * @projectName: Galaxy Life / Hide Tab Bar
 * @author: Norelock (@xkotori)
 * @license: MIT
*/

(function EXTERNAL(w) {
    'use strict';

    const PROTOCOL = w.location.protocol === 'https:' ? 'https://' : 'http://';
    const UTILS = {
        wait: (callback, ms = 0) => {
            if (typeof callback !== 'function') throw 'argument \'callback\' is not a function';
            if (typeof ms !== 'number') throw 'argument \'ms\' is not a number';

            return w.setTimeout(callback, ms);
        },
        injectScript: url => {
            if (typeof url !== 'string') throw 'argument \'url\' is not a string';
            if (url.match(/^(https?:\/\/)/) === null) url = PROTOCOL + url;

            if (url.includes("css")) {
                const style = w.document.createElement('link');
                style.rel = 'stylesheet';
                style.href = url;

                w.document.head.appendChild(style);
            } else {
                const script = w.document.createElement('script');
                script.src = url;

                w.document.body.appendChild(script);
            }
        }
    };

    // Dependencies we need to inject
    (function INJECTOR(inject, dependencies) {
        for (let index = dependencies.length; index--;) {
            const dependency = dependencies[index];

            if (dependency) {
                const url = PROTOCOL + dependency;
                const vaild = w.fetch(url, { method: 'GET', mode: 'no-cors' }).then(response => response.ok);

                if (vaild) inject(url);
            }
        }
    })( UTILS.injectScript, [ 'cdn.clippy.link/assets/fontawesome.js', 'cdn.jsdelivr.net/npm/toastify-js', 'cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css' ] );

    const animationDuration = "0.55s";
    const bar = w.document.getElementById('tab-bar') || w.document.querySelector('#tab-bar');

    if (bar) {
        const gameContent = w.document.getElementById('game') || w.document.querySelector('#game');

        try {
            bar.style.transition = `all ${animationDuration}`;

            if (gameContent)
                gameContent.style.transition = `all ${animationDuration}`;
        } catch (e) {
            throw 'failed to set transition on tab bar';
        }

        let barState = true;
        const button = w.document.createElement('button');

        if (button) {
            const buttonStyle = [
                ['position', 'absolute'],
                ['top', '46px'],
                ['right', '15px'],
                ['width', '30px'],
                ['height', '30px'],
                ['border', 'none'],
                ['background', '#000'],
                ['color', '#fff'],
                ['fontSize', '1em'],
                ['transition', `all ${animationDuration}`],
                ['transform', 'rotate(180deg)'],
                ['borderRadius', '30%'],
                ['zIndex', '1'],
                ['userSelect', 'none'],
                ['outline', 'none'],
            ];
            
            for (let index = buttonStyle.length; index--;) {
                const style = buttonStyle[index];

                if (style) {
                    const key = style[0];
                    const value = style[1];

                    button.style[key] = value;
                }
            }

            button.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
            button.addEventListener('click', () => {
                barState = !barState;

                bar.style.height = barState ? '70px' : '0';
                gameContent.style.height = barState ? 'calc(947/1017 * 100%)' : '100%';
                
                button.style.top = barState ? '46px' : '15px';
                button.style.transform = barState ? 'rotate(180deg)' : 'rotate(0deg)';
                button.style.color = barState ? '#fff' : '#000';
                button.style.background = barState ? '#000' : '#fff';

                if (window['Toastify']) {
                    window['Toastify']({
                        text: barState ? 'Tab Bar is now visible' : 'Tab Bar is now hidden',
                        duration: 3000,
                        close: true,
                        gravity: 'top',
                        position: 'right',
                        backgroundColor: '#000',
                        textColor: '#fff',
                        className: 'toastify',
                        stopOnFocus: true,
                    }).showToast();
                }
            });

            bar.appendChild(button);
        }
    }
})(window || globalThis || self);
