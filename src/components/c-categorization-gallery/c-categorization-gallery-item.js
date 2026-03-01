import {
    ACTION_EXTRACT,
    ACTION_FANCY,
    ACTION_NONE, EVENT_EXTRACT,
    EVENT_SELECT,
    ICON_EXPAND,
    ICON_EXTRACT,
    ICON_FANCY
} from "@/components/enum";

const CCategorizationGalleryItemSheet = new CSSStyleSheet();
CCategorizationGalleryItemSheet.replaceSync(`
    :host {
        min-width: var(--host-width, 100%);
    }

    .item {
        position: relative;
        display: grid;
        grid-template-areas: "state" "body";
        grid-template-rows: 26px 1fr;
        grid-template-columns: 1fr;
        padding: 8px;
        border: 1px solid #bcbcbc;
        border-radius: 4px;
        background-color: #fff;
        cursor: pointer;
        width: calc(100% - 18px);
        height: calc(100% - 18px);
        transition: width 0.3s ease, opacity 0.3s ease;
    }
    
    .item-hidden {
        width: 0;
        opacity: 0;
        border: 0;
        padding-left: 0;
        padding-right: 0;        
        overflow: hidden;                    
    }

    .item-state {
        grid-area: state;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px solid #bcbcbc;
    }
    
    .item-selected {
        border-color: #4f91ff;
        z-index: 3;
    }
    
    .item-selected::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 4px;
        background-color: #4f91ff;
    }
    
    .item-body {
        grid-area: body;
        padding-top: 8px;
        overflow: hidden;
    }
    
    .item img {
        max-width: 100%;
        max-height: 152px;
    }
    
    .item-content {
        height: 100%;
        overflow: hidden;
        overflow-y: auto;
    }
    
    .item-content-central {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    
    .item-text p:first-child {
        margin-top: 0;
    }
    
    .item-text p:last-child {
        margin-bottom: 0;
    }
    
    .item-bucket {
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    
    .includes {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        min-width: 80%;
        font-size: 12px;
        color: #888888;
        overflow: hidden;
    }

    .includes:empty::before {
        content: 'empty';
        font-style: italic;
        font-size: 16px;
    }
    
    .includes::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 20px;
        background: linear-gradient(270deg, rgba(255, 255, 255, 0) 0%, white 100%);
    }
    
    .bucket {
        display: block;
        min-width: 18px;
        height: 18px;
        border-radius: 20%;
        background-color: #1e80d4;
        color: white;
        text-align: center;
        line-height: 18px;
        font-size: 12px;
    }
    
    .bucket-mini {
        transform: scale(.9);
        line-height: 20px;
    }
    
    .none {
        display: none;
    }
    
    .icon-expand {
        width: 14px;
        height: 14px;
        background-repeat: no-repeat;
        background-size: contain;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M295 183l-17 17L312 233.9l17-17 135-135 0 86.1 0 24 48 0 0-24 0-144 0-24L488 0 344 0 320 0l0 48 24 0 86.1 0L295 183zM217 329l17-17L200 278.1l-17 17L48 430.1 48 344l0-24L0 320l0 24L0 488l0 24 24 0 144 0 24 0 0-48-24 0-86.1 0L217 329z'/%3E%3C/svg%3E");
    }
    
    .icon-extract {
        width: 20px;
        height: 20px;
        background-repeat: no-repeat;
        background-size: contain;
        background-position: center;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='%238cb7ff' d='M432 280l-24 0L40 280l-24 0 0-48 24 0 368 0 24 0 0 48z'/%3E%3C/svg%3E");
    }
`);

class CCategorizationGalleryItem extends HTMLElement {
    _item;
    _itemState;
    _itemContent;
    _itemIncludes;
    _itemText;
    _bucket;
    _bucketNumber;
    _group;
    _id;
    _ownerCategoryId;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [CCategorizationGalleryItemSheet];
        this.shadowRoot.innerHTML = `
            <div class="item js-item">
                <div class="item-state js-item-state">
                    <div class="item-bucket js-item-bucket">
                        <span class="bucket js-bucket none"></span>
                    </div>
                    <div class="includes js-includes"></div>
                    <div class="item-action js-item-action none" role="button">
                        <div class="item-action-icon icon-extract"></div>
                    </div>
                </div>
                <div class="item-body js-item-body">
                    <div class="item-content js-item-content">
                        <div class="item-text js-item-text"></div>
                    </div>
                </div>
            </div>
        `;

        this._item = this.shadowRoot.querySelector('.js-item');
        this._itemState = this.shadowRoot.querySelector('.js-item-state');
        this._itemIncludes = this.shadowRoot.querySelector('.js-includes');
        this._itemBody = this.shadowRoot.querySelector('.js-item-body');
        this._itemContent = this.shadowRoot.querySelector('.js-item-content');
        this._itemText = this.shadowRoot.querySelector('.js-item-text');
        this._bucket = this.shadowRoot.querySelector('.js-bucket');
        this._itemAction = this.shadowRoot.querySelector('.js-item-action');

        this._registerListeners();
    }

    static get observedAttributes() {
        return ['s-selected', 's-hidden', 's-includes', 's-cancelled'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }

        switch (name) {
            case 's-selected':
                this._toggleSelect(newValue === null ? false : true);

                break;
            case 's-hidden':
                if (newValue === null) {
                    this._show();
                } else {
                    this._hide();
                }

                break;
            case 's-includes':
                const buckets = JSON.parse(newValue || '[]');
                this._updateIncludes(buckets);

                break;
            case 's-cancelled':
                // if (newValue !== null) {
                //     this._item.classList.add('item-cancelled');
                //     setTimeout(() => {
                //         this.removeAttribute('c-cancelled');
                //     }, 100);
                // } else {
                //     this._item.classList.remove('item-cancelled');
                // }

                break;
        }
    }

    initialize({group, id, text, bucketNumber, fancy, action, ownerCategoryId}) {
        this._action = action;
        this._group = group;
        this._id = id;
        this._ownerCategoryId = ownerCategoryId;

        this._initializeText(text, fancy);
        this._initializeBucket(bucketNumber);
        this._initialAction()
    }

    _handler(event) {
        const isActionClick = this._itemAction.contains(event.target);

        if (isActionClick) {
            const actions = {
                [ACTION_EXTRACT]: () => this._onExtract()
            };
            actions[this._action]?.();
            return;
        }

        if (this._action === ACTION_EXTRACT) return;

        this._onSelect();
    }

    _hide() {
        this._item.addEventListener('transitionend', () => {
            this.setAttribute('hidden', 'true');
        }, { once: true });

        setTimeout(() => {
            this._item.classList.add('item-hidden');
        }, 100);
    }

    _initialAction() {
        if (this._action) {
            this._itemIncludes.classList.add('none');
            this._itemAction.classList.remove('none');
        }
    }

    _initializeBucket(bucketNumber) {
        if (bucketNumber !== undefined && bucketNumber !== null) {
            this._bucket.innerText = this._bucketNumber = bucketNumber;
            this._bucket.classList.remove('none');
            this._itemIncludes.classList.add('none');
        } else {
            this._bucket.classList.add('none');
        }
    }

    _initializeText(text, fancy) {
        this._itemText[fancy ? 'innerHTML': 'innerText'] = fancy ? fancy : text;
        this._itemContent.classList[fancy ? 'remove' : 'add']('item-content-central');
    }

    _onExtract() {
        this.dispatchEvent(new CustomEvent(EVENT_EXTRACT, {
            detail: {
                categoryId: this._ownerCategoryId,
                optionId: this._id,
            },
            bubbles: true,
            composed: true,
        }));

        this.remove();
    }

    _onSelect() {
        this.dispatchEvent(new CustomEvent(EVENT_SELECT, {
            detail: {
                group: this._group,
                id: this._id,
                bucketNumber: this._bucketNumber,
            },
            bubbles: true,
            composed: true,
        }));
    }

    _registerListeners() {
        this._abortController?.abort();

        this._abortController = new AbortController();

        this._item.addEventListener('click', this._handler.bind(this), {signal: this._abortController.signal});
    }

    _show() {
        this.removeAttribute('hidden');

        setTimeout(() => {
            this._item.classList.remove('item-hidden');
        });
    }

    _toggleSelect(status) {
        this._item.classList[status ? 'add' : 'remove']('item-selected');
    }

    _updateIncludes(buckets) {
        this._itemIncludes.innerHTML = '';

        if (buckets.length === 0) {
            return;
        }

        const bucketElement = document.createElement('span');
        bucketElement.classList.add('bucket', 'bucket-mini');

        buckets.forEach(bucketNumber => {
            const appendBucket = bucketElement.cloneNode();
            appendBucket.innerText = bucketNumber;
            this._itemIncludes.appendChild(appendBucket);
        });

        const expandIcon = document.createElement('span');
        expandIcon.classList.add(ICON_EXPAND);

        this._itemIncludes.appendChild(expandIcon);
    }
}

window.customElements.define('c-categorization-gallery-item', CCategorizationGalleryItem);