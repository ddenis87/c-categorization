import {
    ACTION_EXTRACT,
    ACTION_FANCY,
    ACTION_NONE,
    EVENT_EXTRACT,
    EVENT_FANCY,
    EVENT_SELECT,
    ICON_EXPAND,
    ICON_EXTRACT,
    ICON_FANCY,
} from "@/components/enum";

class CCategorizationMobileItem extends HTMLElement {
    _abortController;
    _item;
    _itemBucket;
    _itemText;
    _itemAction;
    _itemActionIcon;
    /* @type {string} */
    _itemFancyText;
    _itemIncludes;
    _bucketContent;
    _bucketNumber;
    _group;
    _id;
    _action;
    _ownerCategoryId;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>                
                .item {
                    position: relative;
                    display: grid;
                    grid-template-areas: "item-content item-action";
                    grid-template-columns: 1fr 40px;
                    grid-template-rows: auto;
                    padding: 0px 0 0px 8px;
                    border: thin solid grey;
                    border-radius: 4px;
                    background-color: white;
                    gap: 6px;
                    transition: height 0.3s ease, opacity 0.3s ease, box-shadow 1s ease;
                    height: var(--item-height, auto);
                }
                
                .item-has-bucket {
                    grid-template-areas: "item-bucket item-content item-action";
                    grid-template-columns: 26px 1fr 40px;
                }
                
                .item-hide {
                    height: 0;
                    opacity: 0;
                    border: 0;
                    overflow: hidden;                    
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
                
                .item-cancelled {
                    transition: none;
                    box-shadow: inset 0px 0px 2px 1px #ff0000;
                }
                
                .item-bucket,
                .item-content,
                .item-active {
                    padding: 14px 0;
                }
                
                .item-bucket {
                    grid-area: item-bucket;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                }

                .item-content {
                    grid-area: item-content;
                }
                
                .item-includes {
                    position: absolute;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    bottom: 2px;
                    left: 60%;
                    font-size: 12px;
                    color: #888888;
                    width: 98px;
                    overflow: hidden;
                }
                
                .item-includes::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 20px;
                    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, white 100%);
                }
                
                .item-action {
                    grid-area: item-action;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 14px 8px;
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
                
                .d-none {
                    display: none;
                }
                
                .icon-expand {
                    width: 14px;
                    height: 14px;
                    background-repeat: no-repeat;
                    background-size: contain;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath d='M295 183l-17 17L312 233.9l17-17 135-135 0 86.1 0 24 48 0 0-24 0-144 0-24L488 0 344 0 320 0l0 48 24 0 86.1 0L295 183zM217 329l17-17L200 278.1l-17 17L48 430.1 48 344l0-24L0 320l0 24L0 488l0 24 24 0 144 0 24 0 0-48-24 0-86.1 0L217 329z'/%3E%3C/svg%3E");
                }
                
                .icon-fancy {
                    width: 20px;
                    height: 20px;
                    background-repeat: no-repeat;
                    background-size: contain;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%238cb7ff' d='M464 256a208 208 0 1 0-416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1-512 0zm256-80c-17.7 0-32 14.3-32 32 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-44.2 35.8-80 80-80s80 35.8 80 80c0 47.2-36 67.2-56 74.5l0 3.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-8.1c0-20.5 14.8-35.2 30.1-40.2 6.4-2.1 13.2-5.5 18.2-10.3 4.3-4.2 7.7-10 7.7-19.6 0-17.7-14.3-32-32-32zM224 368a32 32 0 1 1 64 0 32 32 0 1 1-64 0z'/%3E%3C/svg%3E");
                }
                
                .icon-extract {
                    width: 20px;
                    height: 20px;
                    background-repeat: no-repeat;
                    background-size: contain;
                    background-position: center;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'%3E%3Cpath fill='%238cb7ff' d='M432 280l-24 0L40 280l-24 0 0-48 24 0 368 0 24 0 0 48z'/%3E%3C/svg%3E");
                }
            </style>
            <div class="item js-item">
                <div class="item-bucket js-item-bucket d-none">
                    <span class="bucket js-bucket-content"></span>
                </div>
                <div class="item-content">
                    <div class="item-text js-item-text"></div>
                    <div class="item-includes js-item-includes"></div>
                </div>
                <div class="item-action js-item-action" role="button">
                    <div class="item-action-icon js-item-action-icon"></div>
                </div>
            </div>
        `;

        this._item = this.shadowRoot.querySelector('.js-item');
        this._itemBucket = this.shadowRoot.querySelector('.js-item-bucket');
        this._itemText = this.shadowRoot.querySelector('.js-item-text');
        this._itemAction = this.shadowRoot.querySelector('.js-item-action');
        this._itemActionIcon = this.shadowRoot.querySelector('.js-item-action-icon');
        this._itemIncludes = this.shadowRoot.querySelector('.js-item-includes')
        this._bucketContent = this.shadowRoot.querySelector('.js-bucket-content');

        this._registerListeners();
    }

    static get observedAttributes() {
        return ['c-selected', 'c-hidden', 'c-includes', 'c-cancelled'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }

        switch (name) {
            case 'c-selected':
                this._toggleSelect(newValue === null ? false : true);

                break;
            case 'c-hidden':
                if (newValue === null) {
                    this._show();
                } else {
                    this._hide();
                }

                break;
            case 'c-includes':
                const buckets = JSON.parse(newValue || '[]');
                this._updateIncludes(buckets);

                break;
            case 'c-cancelled':
                if (newValue !== null) {
                    this._item.classList.add('item-cancelled');
                    setTimeout(() => {
                        this.removeAttribute('c-cancelled');
                    }, 100);
                } else {
                    this._item.classList.remove('item-cancelled');
                }

                break;
        }
    }

    initialize({group, id, text, bucketNumber, fancy, action, ownerCategoryId}) {
        this._group = group;
        this._id = id;
        this._ownerCategoryId = ownerCategoryId;

        this._initializeText(text);
        this._initializeBucket(bucketNumber);
        this._initializeFancyText(fancy);
        this._initialAction(action);
    }

    _initializeText(text) {
        this._itemText.innerText = text;
    }

    _initializeBucket(bucketNumber) {
        if (bucketNumber !== undefined && bucketNumber !== null) {
            this._bucketContent.innerText = this._bucketNumber = bucketNumber;
            this._itemBucket.classList.remove('d-none');
            this._item.classList.add('item-has-bucket');
        } else {
            this._itemBucket.classList.add('d-none');
            this._item.classList.remove('item-has-bucket');
        }
    }

    _initializeFancyText(fancy) {
        if (fancy) {
            this._itemFancyText = fancy;
        }
    }

    _initialAction(action) {
        let classIcon;
        switch (action) {
            case ACTION_FANCY:
                classIcon = ICON_FANCY;
                break;
            case ACTION_EXTRACT:
                classIcon = ICON_EXTRACT;
                break;
            case ACTION_NONE:
            default:
                classIcon = 'd-none';
                break;
        }

        this._action = action;
        this._itemActionIcon.className = classIcon;
    }

    _registerListeners() {
        this._abortController?.abort();

        this._abortController = new AbortController();

        this._item.addEventListener('click', this._handler.bind(this), {signal: this._abortController.signal});
    }

    _handler(event) {
        const isActionClick = this._itemAction.contains(event.target);

        if (isActionClick) {
            const actions = {
                [ACTION_FANCY]: () => this._onFancy(),
                [ACTION_EXTRACT]: () => this._onExtract()
            };
            // Вызываем экшен, если он есть в мапе
            actions[this._action]?.();
            return;
        }

        if (this._action === ACTION_EXTRACT) return;

        this._onSelect();
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

    _onFancy() {
        this.dispatchEvent(new CustomEvent(EVENT_FANCY, {
            detail: {
                title: this._itemText.innerText,
                text: this._itemFancyText,
            },
            bubbles: true,
            composed: true,
        }));
    }

    _updateIncludes(buckets) {
        this._itemIncludes.innerHTML = '';

        if (buckets.length === 0) {
            return;
        }

        const bucketElement = document.createElement('span');
        bucketElement.classList.add('bucket', 'bucket-mini');

        const expandIcon = document.createElement('span');
        expandIcon.classList.add(ICON_EXPAND);

        this._itemIncludes.appendChild(expandIcon);

        buckets.forEach(bucketNumber => {
            const appendBucket = bucketElement.cloneNode();
            appendBucket.innerText = bucketNumber;
            this._itemIncludes.appendChild(appendBucket);
        });
    }

    _toggleSelect(status) {
        this._item.classList[status ? 'add' : 'remove']('item-selected');
    }

    _hide() {
        const height = this._item.scrollHeight;
        this._item.style.setProperty('--item-height', height + 'px');

        this._item.addEventListener('transitionend', () => {
            this.setAttribute('hidden', 'true');
        }, { once: true });

        setTimeout(() => {
            this._item.classList.add('item-hide');
        }, 100);
    }

    _show() {
        this.removeAttribute('hidden');

        const height = this._item.scrollHeight;

        this._item.style.setProperty('--item-height', '0px');
        this._item.style.setProperty('--item-height', height + 'px');

        setTimeout(() => {
            this._item.classList.remove('item-hide');
        });
    }
}

window.customElements.define('c-categorization-mobile-item', CCategorizationMobileItem);