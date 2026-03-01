const CSystemBarSheet = new CSSStyleSheet();
CSystemBarSheet.replaceSync(`
    .system {
        display: grid;
        grid-template-areas: "message control";
        grid-template-columns: 1fr 50px;
        justify-content: space-between;
        align-items: center;
        border-bottom: thin solid lightgray;
        height: 100%;
    }
    
    .control {
        grid-area: control;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 100%;
    }
    
    .message {
        grid-area: message;
        padding-left: 14px;
        color: #333333;
    }
    
    .icon-check {
        width: 24px;
        height: 24px;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='%238cb7ff' d='M448 130L431 147 177.5 399.2l-16.9 16.9-16.9-16.9L17 273.1 0 256.2l33.9-34 17 16.9L160.6 348.3 397.1 112.9l17-16.9L448 130z'/%3E%3C/svg%3E");
    }
    
    .icon-clear {
        width: 24px;
        height: 24px;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%238cb7ff' d='M336 144L480 0l32 32L368 176l48 48L265.7 469.9 240 512l-34.9-34.9L34.9 306.9 0 272l42.1-25.7L288 96l48 48zM77 281.2L102.9 307 160 288l-19 57.1L230.8 435l89.6-146.6-96.8-96.8L77 281.2z'/%3E%3C/svg%3E");
    }
    
    .icon-cancel {
        width: 24px;
        height: 24px;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='%238cb7ff' d='M345 137l17-17L328 86.1l-17 17-119 119L73 103l-17-17L22.1 120l17 17 119 119L39 375l-17 17L56 425.9l17-17 119-119L311 409l17 17L361.9 392l-17-17-119-119L345 137z'/%3E%3C/svg%3E");
    }
`);

import {ICON_CANCEL, ICON_CLEAR, STATE_DEFAULT, STATE_EXPANDED, STATE_SELECTED} from "@/components/enum";

class CSystemBar extends HTMLElement {
    _abortController;
    _systemMessageMap;
    _state;

    _messageElement;
    _control;
    _controlIcon;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [CSystemBarSheet];
        this.shadowRoot.innerHTML = `
            <div class="system">
                <div class="message js-message"></div>
                <div class="control js-control" role="button">
                    <span></span>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        this._control = this.shadowRoot.querySelector('.js-control');
        this._controlIcon = this._control.querySelector('span');
        this._messageElement = this.shadowRoot.querySelector('.js-message');

        this._registerListeners();
    }

    initialize(systemMessageMap) {
        this._systemMessageMap = systemMessageMap;

        this._setState(STATE_DEFAULT);
    }

    _setState(state) {
        this._state = state;
        this._messageElement.textContent = this._systemMessageMap[this._state];

        switch (this._state) {
            case STATE_DEFAULT:
                this._controlIcon.className = ''
                break;
            case STATE_SELECTED:
                this._controlIcon.className = ICON_CANCEL
                break;
            case STATE_EXPANDED:
                this._controlIcon.className = ICON_CLEAR
                break;
        }
    }

    _registerListeners() {
        this._abortController?.abort();

        this._abortController = new AbortController();

        // this event may be triggered outside of this component
        this.addEventListener('active-state', this._handler.bind(this), { signal: this._abortController.signal });

        this._control.addEventListener('click', this._onAction.bind(this), { signal: this._abortController.signal });
    }

    _onAction(event) {
        this.dispatchEvent(new CustomEvent('system-action', {
            detail: { state: this._state },
            bubbles: true,
            composed: true,
        }));
    }

    _handler(event) {
        switch (event.type) {
            case 'active-state':
                this._setState(event.detail.key);
                break;
        }
    }
}

window.customElements.define('c-system-bar', CSystemBar);