const CLayoutMobileSheet = new CSSStyleSheet();
CLayoutMobileSheet.replaceSync(`
    .c-layout-mobile {
        display: grid;
        grid-template-areas: "header" "main" "footer";
        grid-template-rows: auto calc(100vh - 52px) 52px;
        grid-template-columns: 1fr;
        height: 100%;
    }
    
    ::slotted(.header) {
        grid-area: header;
    }
    
    ::slotted(.main) {
        grid-area: main;
    }
    
    ::slotted(.footer) {
        grid-area: footer;
        
        width: 100vw;
        background-color: white;
        border-top: thin solid grey;
        display: flex;
        justify-content: space-between;
        padding: 8px;
        box-sizing: border-box;
        gap: 8px;
    }
`);

export default class CLayoutMobile extends HTMLElement {
    _abortController;
    _container;

    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.shadowRoot.adoptedStyleSheets = [CLayoutMobileSheet];
        this.shadowRoot.innerHTML = `
            <div class="c-layout-mobile">
                <slot name="header" class="header"></slot>
                <slot name="main" class="main"></slot>
                <slot name="footer" class="footer"></slot>
            </div>
        `;
    }

    connectedCallback() {
        this._container = this.shadowRoot.querySelector('.c-layout-mobile');

        this._registerListeners();
    }

    _registerListeners() {
        this._abortController?.abort();
        this._abortController = new AbortController();

        this._container.addEventListener('slotchange', this._onSlotChange.bind(this), {signal: this._abortController.signal});
    }

    _onSlotChange(event) {
        const child = event.target.assignedElements()[0];
        if (child) {
            child.className = `${event.target.getAttribute('class') || ''} ${child.className}`;
        }
    }
}

window.customElements.define('c-layout-mobile', CLayoutMobile);