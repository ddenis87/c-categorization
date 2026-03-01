import '../c-system-bar.js';
import './c-categorization-mobile-worksheet.js';
import {EVENT_EXTRACT_ALL, EVENT_UNSELECT, STATE_EXPANDED, STATE_SELECTED} from "@/components/enum";

class CCategorizationMobile extends HTMLElement {
    /* @type {AbortController} */
    _abortController;
    /* @type {HTMLElement} */
    _system;
    /* @type {HTMLElement} */
    _worksheet;

    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
            <style>
                .c-categorization-mobile {
                    display: grid;
                    grid-template-areas: "system" "worksheet";
                    grid-template-rows: 50px 1fr;
                    grid-template-columns: 1fr;
                    height: 100%;
                }
                c-system-bar {
                    grid-area: system;
                }
            
                c-categorization-mobile-worksheet {
                    grid-area: worksheet;
                    overflow: hidden;
                }
            </style>
            <div class="c-categorization-mobile">
                <c-system-bar></c-system-bar>
                <c-categorization-mobile-worksheet></c-categorization-mobile-worksheet>
            </div>`;
    }

    connectedCallback() {
        this._system = this.shadowRoot.querySelector('c-system-bar');
        this._worksheet = this.shadowRoot.querySelector('c-categorization-mobile-worksheet');
    }

    initialize(systemMessageMap, options, categories, numberOfResponses) {
        this._system.initialize(systemMessageMap);
        this._worksheet.initialize(options, categories, numberOfResponses);

        this._registerListeners();
    }

    _registerListeners() {
        this._abortController?.abort();

        this._abortController = new AbortController();

        this.addEventListener('system-state', this._systemStateHandler.bind(this), {signal: this._abortController.signal});
        this.addEventListener('system-action', this._systemActionHandler.bind(this), {signal: this._abortController.signal});
    }

    _systemActionHandler(event) {
        const {state} = event.detail;
        switch (state) {
            case STATE_SELECTED:
                this._worksheet.dispatchEvent(new CustomEvent(EVENT_UNSELECT));
                break;
            case STATE_EXPANDED:
                this._worksheet.dispatchEvent(new CustomEvent(EVENT_EXTRACT_ALL));
        }
    }

    _systemStateHandler(event) {
        const {key} = event.detail;
        switch (key) {
            case 'selected':
                const {selectedOptions} = event.detail;
                this._changeSystemState(selectedOptions.length ? 'selected' : 'default');
                break;
            case 'default':
                this._changeSystemState('default');
                break;
            default:
                this._changeSystemState(key)
                break;
        }
    }

    _changeSystemState(key) {
        this._system.dispatchEvent(new CustomEvent('active-state', {
            detail: {
                key: key,
            },
        }));
    }
}

window.customElements.define('c-categorization-mobile', CCategorizationMobile);