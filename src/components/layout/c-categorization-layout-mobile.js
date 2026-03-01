import {EVENT_EXTRACT_ALL, EVENT_UNSELECT, STATE_EXPANDED, STATE_SELECTED} from "@/components/enum";

const CCategorizationLayoutMobileSheet = new CSSStyleSheet();
CCategorizationLayoutMobileSheet.replaceSync(`
    .c-container {
        display: grid;
        grid-template-areas: "system-bar" "worksheet";
        grid-template-rows: 50px 1fr;
        grid-template-columns: 1fr;
        height: 100%;
    }
    
    .c-system-bar {
        grid-area: system-bar;
    }   

    .c-worksheet {
        grid-area: worksheet;
        overflow: hidden;
    }
`);

export default class CCategorizationLayoutMobile extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.shadowRoot.adoptedStyleSheets = [CCategorizationLayoutMobileSheet];
    }

    connectedCallback() {
        this._system = this.shadowRoot.querySelector('.c-system-bar');
        this._worksheet = this.shadowRoot.querySelector('.c-worksheet');
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