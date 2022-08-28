/*
 * @projectName: Galaxy Life Display Ping
 * @author: Norelock (@xkotori)
 * @license: MIT
*/

(function EXTERNAL(w) {
    'use strict';

    let CURRENT_STATUS = "offline";
    let CURRENT_PING = 0;

    const PROTOCOL = w.location.protocol === 'https:' ? "https://" : "http://";

    let SERVER_URL = "";
    const MASTER_URL = `${PROTOCOL}game.galaxylifegame.net/director/getMaster`;

    const UTILS = {
        wait: (callback, ms = 0) => {
            if (typeof callback !== 'function') throw 'argument \'callback\' is not a function';
            if (typeof ms !== 'number') throw 'argument \'ms\' is not a number';

            return w.setTimeout(callback, ms);
        },
        formatNumber: (value, fractionDigits = 0, roundNearest = 1) => {
            const power = w.Math.pow(10, fractionDigits);

            return w.String(w.Math.round(value * power / roundNearest) / power * roundNearest);
        },
        measureResponse: (start = 0) => {
            if (typeof start !== 'number') throw 'argument \'start\' is not a number';

            CURRENT_PING = w.performance.now() - start;
        },
        isEmptyOrSpaces: str => {
            if (typeof str !== 'string') throw 'argument \'str\' is not a string';

            return str === null || str.match(/^ *$/) !== null;
        },
        drawTextWithStroke: (ctx, text, textSize = 11, x, y, color, strokeColor, strokeWidth) => {
            if (!(ctx instanceof w.CanvasRenderingContext2D)) throw 'argument \'ctx\' is not a CanvasRenderingContext2D';
            
            if (typeof text !== 'string') throw 'argument \'text\' is not a string';
            if (typeof textSize !== 'number') throw 'argument \'textSize\' is not a number';

            if (typeof x !== 'number') throw 'argument \'x\' is not a number';
            if (typeof y !== 'number') throw 'argument \'y\' is not a number';

            if (!color || UTILS.isEmptyOrSpaces(color)) color = '#fff';
            if (!strokeColor || UTILS.isEmptyOrSpaces(strokeColor)) strokeColor = '#000';

            ctx.font = textSize + 'px Aldrich';
            ctx.fillStyle = color;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.strokeText(text, x, y);
            ctx.fillText(text, x, y);
        }
    };

    async function fetchServerUrl() {
        const response = await w.fetch(MASTER_URL);

        if (response.status === 200)
            SERVER_URL = await response.text();
        else
            throw 'couldn\'t\' find server url';
    }
    fetchServerUrl();

    async function fetchStatus() {
        if (UTILS.isEmptyOrSpaces(SERVER_URL)) throw 'server url isn\'t\ reached';

        try {
            const response = await w.fetch(SERVER_URL);

            CURRENT_STATUS = response.status !== 503 ? 'online' : 'offline';
        } catch (e) {
            throw e;
        }
    }

    (function RUNTIME(utils, status) {
        const PING_INTERVAL = 5 * 1000;

        async function ping() {
            const start = w.performance.now();

            try {
                await status();

                utils.measureResponse(start);
            } catch (e) { }

            utils.wait(ping, PING_INTERVAL);
        }
        utils.wait(ping, 500); // due to server_url fetching qwq
    })(UTILS, fetchStatus);

    // Display
    const canvas = w.document.createElement('canvas');

    const gameBar = w.document.getElementById('tab-bar') || w.document.querySelector('#tab-bar');
    const gameStage = w.document.getElementById('GameMovie') || w.document.querySelector('#GameMovie');
    const gameContent = w.document.getElementById('game') || w.document.querySelector('#game');

    if (canvas && gameContent) {
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1';
        canvas.style.pointerEvents = 'none';

        gameContent.appendChild(canvas);
    }

    function resizeCanvas() {
        if (gameBar) {
            canvas.style.top = gameBar.offsetHeight + 'px';
        }

        if (gameStage) {
            const rect = gameStage.getBoundingClientRect();

            if (canvas.width !== rect.width) {
                canvas.width = rect.width;

                canvas.style.width = canvas.width + 'px';
            }

            if (canvas.height !== rect.height) {
                canvas.height = rect.height;

                canvas.style.height = canvas.height + 'px';
            }
        }
    }
    resizeCanvas();

    const ctx = canvas ? canvas.getContext('2d') : undefined;

    const labels = [
        [
            'Galaxy Life Display Ping by Norelock',
            {
                size: 16,
                color: '#fff',
            }
        ],
        [
            'Ping: [ping]ms',
            {
                size: 12,
                color: 'ping',
            }
        ],
        [
            'Server status: [status]',
            {
                size: 12,
                color: 'status',
            }
        ],
    ];

    function draw(/* timestamp = 0 */) {
        w.requestAnimationFrame(draw);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Draw labels
        for (let index = 0; index < labels.length; index++) {
            const [ text, style ] = labels[index];

            if (text && style) {
                const { size, color } = style;

                // offset + line height by defined font size
                const labelOffsetY = index * 20 + size;

                const labelColor = (() => {
                    if (color === 'status') return CURRENT_STATUS === 'online' ? '#0f0' : '#f00';
                    if (color === 'ping') return CURRENT_PING > 100 ? '#f00' : CURRENT_PING > 50 ? '#ff0' : '#0f0';

                    return color;
                })();

                const labelText = text.replace('[status]', CURRENT_STATUS.toUpperCase()).replace('[ping]', UTILS.formatNumber(CURRENT_PING));
                
                UTILS.drawTextWithStroke(ctx, labelText, size, 10, labelOffsetY, labelColor, '#000', 3);
            }
        }
    }
    draw();

    // Event listeners
    w.addEventListener('resize', resizeCanvas);
})(window || globalThis || self);
