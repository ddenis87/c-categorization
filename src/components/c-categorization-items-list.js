import {EVENT_EXTRACT_ALL} from "@/components/enum";

const CCategorizationItemsListSheet = new CSSStyleSheet();
CCategorizationItemsListSheet.replaceSync(`
    .expanded {
        position: absolute;
        
        top: 4px;
        left: 4px;
        right: 4px;
        border: 1px solid #bcbcbc;
        border-radius: 8px;
        background-color: #ffffff;
        z-index: 3;
        opacity: 0;
        height: 0;
        overflow: hidden;
        transition: height 0.3s ease, opacity 0.3s ease;
    }
    
    .expanded img {
        max-width: 100%;
        max-height: 152px;
    }
    
    .expanded-show {
        opacity: 1;
        height: var(--expanded-height, auto);
    }
    
    .header {
        display: grid;
        grid-template-areas: "control" "title";
        grid-template-columns: 1fr;
        grid-template-rows: 32px 1fr;
        background-color: #f1f1f1;
        border-bottom: 1px solid #ccc;
        max-height: 50%;
    }
    
    .control {
        grid-area: control;
        display: flex;
        justify-content: flex-end;
        padding: 8px;
    }
    
    .title {
        grid-area: title;
        padding: 8px;
        overflow-y: auto;
    }
    
    .title-central {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    
    .content {
        padding: 4px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .close-button {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 30px;
        height: 100%;
    }
    
    .close-button svg {
        fill: #666666;
        transform: scale(.6);
    }
`);

class CCategorizationItemsList extends HTMLElement {
    _abortController;

    _expanded;
    _title;
    _closeButton;
    _content;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [CCategorizationItemsListSheet];
        this.shadowRoot.innerHTML = `
            <div class="expanded js-expanded">
                <div class="header">
                    <div class="control">
                        <div class="close-button js-close-button" role="button">
                            <svg viewBox="0 0 384 512" style="width: 24px;">
                                <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="title js-title">
                        <div class="title-text js-title-text"></div>
                    </div>
                </div>
                <div class="content js-content">Option 1</div>
            </div>
        `;
    }

    connectedCallback() {
        this._expanded = this.shadowRoot.querySelector('.js-expanded');
        this._title = this.shadowRoot.querySelector('.js-title');
        this._titleText = this.shadowRoot.querySelector('.js-title-text');
        this._closeButton = this.shadowRoot.querySelector('.js-close-button');
        this._content = this.shadowRoot.querySelector('.js-content');

        this._registerListeners();
    }

    initialize(categoryId, categoryTexts, optionsMap, itemTagName) {
        this.setAttribute('category-id', categoryId);

        this._initializeText(categoryTexts);

        this._content.innerHTML = '';
        const itemElement = document.createElement(itemTagName);

        optionsMap.forEach(options => {
            const appendElement = itemElement.cloneNode();
            appendElement.initialize({
                group: 'options',
                id: options.id,
                text: options.TEXT,
                action: 'extract',
                ownerCategoryId: categoryId,
            });

            this._content.appendChild(appendElement);
        });
    }

    _initializeText(categoryTexts) {
        const {text, fancy} = categoryTexts;
        this._titleText[fancy ? 'innerHTML': 'innerText'] = fancy ? fancy : text;
        this._title.classList[fancy ? 'remove' : 'add']('title-central');
    }

    _registerListeners() {
        this._abortController?.abort();

        this._abortController = new AbortController();

        this.addEventListener(EVENT_EXTRACT_ALL, this._extractAll.bind(this), { signal: this._abortController.signal });

        this._expanded.addEventListener('click', this._handleClick.bind(this), {signal: this._abortController.signal});
    }

    _extractAll() {
        this._content.innerHTML = '';

        setTimeout(() => {
            this._close();
        }, 200);
    }

    _handleClick(event) {
        const target = event.target;

        if (target === this._closeButton || this._closeButton.contains(target)) {
            this._close();
            return;
        }
    }

    show() {
        const parentHeight = this.parentElement.clientHeight;
        this._expanded.style.setProperty('--expanded-height', (parentHeight - 8) + 'px');

        this._expanded.classList.add('expanded-show');
    }

    _close() {
        this.removeAttribute('category-id');
        this._expanded.classList.remove('expanded-show');

        this.dispatchEvent(new CustomEvent('system-state', {
            detail: {
                key: 'default',
            },
            bubbles: true,
            composed: true,
        }));
    }
}

window.customElements.define('c-categorization-items-list', CCategorizationItemsList);