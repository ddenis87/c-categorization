import './c-categorization-mobile-item.js';
import './c-categorization-mobile-popup.js';
import './c-categorization-mobile-item-expanded.js';
import {
    EVENT_EXTRACT, EVENT_EXTRACT_ALL,
    EVENT_FANCY,
    EVENT_SELECT, EVENT_UNSELECT,
} from "@/components/enum";

class CCategorizationMobileWorksheet extends HTMLElement {
    _abortController;

    _optionsElement;
    _topTitleElement;
    _categoriesElement;
    _bottomTitleElement;
    _popupElement;
    _expandedElement;

    _optionsMap;
    _categoriesMap;
    _optionsSelectedMap;

    _optionsScrollIndicatorElement;
    _categoriesScrollIndicatorElement;

    _from;
    _to;

    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.shadowRoot.innerHTML = `
            <style>
                .worksheet {
                    position: relative;
                    display: grid;
                    grid-template-areas: "wrap-options" "wrap-categories";
                    grid-template-rows: calc(50% - 4px) calc(50% - 4px);
                    grid-template-columns: 1fr;
                    gap: 8px;
                    padding: 4px;
            
                    max-height: calc(100% - 8px); /* minus two padding, top and bottom */
                }
                
                .wrap-options {
                    position: relative;
                    grid-area: wrap-options;
                }
                
                .wrap-categories {
                    position: relative;
                    grid-area: wrap-categories;
                }
                
                .options {
                    background-color: #f1f9f1;
                }
                
                .categories {
                    background-color: #f7f9fb;
                }
            
                .options,
                .categories {
                    position: relative;
                    border: 1px solid #bcbcbc;
                    border-radius: 4px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0px;
                    height: 100%;
                }
                
                .list {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding: 4px;
                }
                
                .disabled .title::before,
                .disabled .list::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(255, 255, 255, 0.6);
                    z-index: 2;
                }
                
                .options-scroll-indicator,
                .categories-scroll-indicator {
                    position: absolute;
                    bottom: -1px;
                    left: 1px;
                    right: 1px;
                    height: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    padding-bottom: 4px;
                    background: linear-gradient(900deg, rgba(242, 255, 242, 0) 0%, rgb(255 255 255) 100%);
                    border-radius: 0 0 4px 4px;
                    z-index: 1;
                    transition: opacity 0.1s ease, z-index 0.3s ease;
                }
                
                .options-scroll-indicator[hidden],
                .categories-scroll-indicator[hidden] {
                    opacity: 0;
                    z-index: -1;
                }
                
                .options-scroll-indicator svg,
                .categories-scroll-indicator svg {
                    width: 18px;
                    height: 18px;
                    padding: 6px;
                    border-radius: 50%;
                    background-color: #ffffff;
                    border: thin solid #1e80d4;
    
                    box-shadow: 0 2px 8px rgba(30, 128, 212, 0.2), 
                                0 1px 3px rgba(0, 0, 0, 0.08);
                }
                
                .options .title {
                    background-color: #f1f9f1;
                }
                
                .categories .title {
                    background-color: #f7f9fb;
                }
                
                .title {
                    position: sticky;
                    top: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 8px 8px 14px 8px;
                    border-bottom: 1px solid #bcbcbc;
                    z-index: 3;
                }
            </style>
            <svg style="display: none;">
                <symbol id="icon-scroll" viewBox="0 0 512 512">
                    <defs><style>.fa-secondary{opacity:.4}</style></defs><path class="fa-secondary" fill='#1e80d4' d="M18.7 64L41.4 86.6l192 192L256 301.3l22.6-22.6 192-192L493.3 64 448 18.7 425.4 41.4 256 210.7 86.6 41.4 64 18.7 18.7 64z"/><path class="fa-primary" fill='#1e80d4' d="M256 493.3l-22.6-22.6-192-192L18.7 256 64 210.7l22.6 22.6L256 402.7 425.4 233.4 448 210.7 493.3 256l-22.6 22.6-192 192L256 493.3z"/>
                </symbol>
            </svg>
            
            <div class="worksheet">
                <div class="wrap-options">
                    <div class="options js-options">
                        <div class="title js-options-title">Options</div>
                        <div class="list js-list"></div>
                    </div>
                    <div class="options-scroll-indicator js-options-scroll-indicator">
                        <svg><use href="#icon-scroll"></use></svg>
                    </div>
                </div>
                <div class="wrap-categories">
                    <div class="categories js-categories">
                        <div class="title js-categories-title">Categories</div>
                        <div class="list js-list"></div>
                    </div>
                    <div class="categories-scroll-indicator js-categories-scroll-indicator">
                        <svg><use href="#icon-scroll"></use></svg>
                    </div>
                </div>
                <c-categorization-mobile-popup></c-categorization-mobile-popup>
                <c-categorization-mobile-item-expanded></c-categorization-mobile-item-expanded>
            </div>
        `;
    }

    connectedCallback() {
        this._abortController = new AbortController();

        this._optionsElement = this.shadowRoot.querySelector('.js-options');
        this._optionsScrollIndicatorElement = this.shadowRoot.querySelector('.js-options-scroll-indicator');
        this._topTitleElement = this.shadowRoot.querySelector('.js-options-title'); // ??
        this._categoriesElement = this.shadowRoot.querySelector('.js-categories');
        this._categoriesScrollIndicatorElement = this.shadowRoot.querySelector('.js-categories-scroll-indicator');
        this._bottomTitleElement = this.shadowRoot.querySelector('.js-categories-title'); // ??
        this._popupElement = this.shadowRoot.querySelector('c-categorization-mobile-popup');
        this._expandedElement = this.shadowRoot.querySelector('c-categorization-mobile-item-expanded');

        this._optionsMap = {};
        this._categoriesMap = {};
        this._optionsSelectedMap = {};

        this._registerListeners();
    }

    static get observedAttributes() {
        // return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // switch (name) {
        // }
    }

    initialize(options, categories, numberOfResponses) {
        const {title: optionsTitle, data: optionsData} = options;
        const {title: categoriesTitle, data: categoriesData} = categories;

        ({from: this._from, to: this._to} = numberOfResponses);

        this._initializeOptionsTitle(optionsTitle);
        this._initializeOptions(optionsData);

        this._initializeCategoriesTitle(categoriesTitle);
        this._initializeCategories(categoriesData);
    }

    _initializeOptionsTitle(title) {
        this._topTitleElement.textContent = title;
    }

    _initializeCategoriesTitle(title) {
        this._bottomTitleElement.textContent = title;
    }

    _initializeOptions(optionsMap) {
        this._optionsMap = {};
        // Clear existing items
        const list = this._optionsElement.querySelector('.js-list');
        list.innerHTML = '';

        // Add top options
        optionsMap.forEach((options, index) => {
            const itemElement = document.createElement('c-categorization-mobile-item');
            const itemProps = {
                group: 'options',
                id: options.id,
                text: options.TEXT,
                bucketNumber: index + 1,
                action: options.FANCY_TEXT ? 'fancy' : 'none',
            };

            if (options.FANCY_TEXT) {
                itemProps.fancy = options.FANCY_TEXT;
            }

            itemElement.initialize(itemProps);

            list.appendChild(itemElement);
            this._optionsMap[options.id] = {
                element: itemElement,
                options,
            };
        });
    }

    _initializeCategories(categoriesMap) {
        this._categoriesMap = {};
        // Clear existing items
        const list = this._categoriesElement.querySelector('.js-list');
        list.innerHTML = '';

        // Add bottom options
        categoriesMap.forEach((options) => {
            const itemElement = document.createElement('c-categorization-mobile-item');
            const itemProps = {
                group: 'categories',
                id: options.id,
                text: options.TEXT,
                action: options.FANCY_TEXT ? 'fancy' : 'none',
            };

            if (options.FANCY_TEXT) {
                itemProps.fancy = options.FANCY_TEXT;
            }

            itemElement.initialize(itemProps);

            list.appendChild(itemElement);
            this._categoriesMap[options.id] = {
                element: itemElement,
                options,
                includes: {},
            };
        });
    }

    _registerListeners() {
        this._abortController?.abort();

        this._abortController = new AbortController();

        // this event may be triggered outside of this component
        this.addEventListener(EVENT_UNSELECT, this._onUnselect.bind(this), {signal: this._abortController.signal});
        this.addEventListener(EVENT_EXTRACT_ALL, this._onExtractAll.bind(this), {signal: this._abortController.signal});

        this.addEventListener(EVENT_EXTRACT, this._onExtract.bind(this), {signal: this._abortController.signal});
        this.addEventListener(EVENT_FANCY, this._showFancy.bind(this), {signal: this._abortController.signal});
        this.addEventListener(EVENT_SELECT, this._onSelect.bind(this), {signal: this._abortController.signal});

        this._optionsElement.addEventListener('scroll', this._onScrollOptions.bind(this), {signal: this._abortController.signal});
        this._categoriesElement.addEventListener('scroll', this._onScrollCategories.bind(this), {signal: this._abortController.signal});
    }

    _onScrollOptions() {
        const scrollTop = this._optionsElement.scrollTop;
        const scrollHeight = this._optionsElement.scrollHeight;
        const offsetHeight = this._optionsElement.offsetHeight;

        if (scrollTop + offsetHeight >= scrollHeight) {
            this._optionsScrollIndicatorElement.setAttribute('hidden', 'true');
        } else {
            this._optionsScrollIndicatorElement.removeAttribute('hidden');
        }
    }

    _onScrollCategories() {
        const scrollTop = this._categoriesElement.scrollTop;
        const scrollHeight = this._categoriesElement.scrollHeight;
        const offsetHeight = this._categoriesElement.offsetHeight;

        if (scrollTop + offsetHeight >= scrollHeight) {
            this._categoriesScrollIndicatorElement.setAttribute('hidden', 'true');
        } else {
            this._categoriesScrollIndicatorElement.removeAttribute('hidden');
        }
    }

    _onExtractAll(event) {
        const categoryId = this._expandedElement.getAttribute('category-id');
        this._categoriesMap[categoryId].element.removeAttribute('c-includes');
        Object.keys(this._categoriesMap[categoryId].includes).forEach(optionId => {
            this._optionsMap[optionId].element.removeAttribute('c-hidden');
            this._optionsMap[optionId].element.removeAttribute('hidden');
        });
        this._categoriesMap[categoryId].includes = {};

        this._expandedElement.dispatchEvent(new CustomEvent(EVENT_EXTRACT_ALL));
    }

    _onExtract(event) {
        const { categoryId, optionId } = event.detail;
        this._optionsMap[optionId].element.removeAttribute('c-hidden');
        this._optionsMap[optionId].element.removeAttribute('hidden');
        const includesBuckets = JSON.parse(this._categoriesMap[categoryId].element.getAttribute('c-includes') || '[]');

        const bucketNumber = this._categoriesMap[categoryId].includes[optionId];
        includesBuckets.splice(includesBuckets.indexOf(bucketNumber), 1);

        if (includesBuckets.length === 0) {
            this._categoriesMap[categoryId].element.removeAttribute('c-includes');
        } else {
            this._categoriesMap[categoryId].element.setAttribute(
                'c-includes',
                JSON.stringify(includesBuckets),
            );
        }
        delete this._categoriesMap[categoryId].includes[optionId];
    }

    _onSelect(event) {
        const { group, id, bucketNumber } = event.detail;

        if (group === 'options') {
            this._selectOption(id, bucketNumber)
        } else if (group === 'categories') {
            this._selectCategory(id);
        }
    }

    _onUnselect() {
        Object.keys(this._optionsSelectedMap).forEach(id => {
            this._optionsMap[id].element.removeAttribute('c-selected');
        });
        this._optionsSelectedMap = {};
        this._optionsElement.classList.remove('disabled');
        this._changeSystemState('default');
    }

    _selectOption(id, bucketNumber) {
        const isSelected = this._optionsMap[id].element.attributes.hasOwnProperty('c-selected');
        if (isSelected) {
            delete this._optionsSelectedMap[id];
            this._optionsMap[id].element.removeAttribute('c-selected')
        } else {
            this._optionsSelectedMap[id] = bucketNumber;
            this._optionsMap[id].element.setAttribute('c-selected', 'true');
        }

        const optionsSelectedMapIds = Object.keys(this._optionsSelectedMap);
        if (optionsSelectedMapIds.length >= this._to) {
            this._optionsElement.classList.add('disabled');
        } else {
            this._optionsElement.classList.remove('disabled');
        }

        this._changeSystemState('selected', {
            selectedOptions: optionsSelectedMapIds,
        })
    }

    _changeSystemState(key, payload) {
        this.dispatchEvent(new CustomEvent('system-state', {
            detail: {
                key,
                ...payload,
            },
            bubbles: true,
            composed: true,
        }));
    }

    _selectCategory(id) {
        const optionsSelectedMapIds = Object.keys(this._optionsSelectedMap);
        if (optionsSelectedMapIds.length) {
            const currentIncludesBucketNumbers = JSON.parse(this._categoriesMap[id].element.getAttribute('c-includes') || '[]');

            if ((currentIncludesBucketNumbers.length + optionsSelectedMapIds.length) > this._to) {
                this._categoriesMap[id].element.setAttribute('c-cancelled', 'true');
                return;
            }

            this._categoriesMap[id].element.setAttribute(
                'c-includes',
                JSON.stringify([...currentIncludesBucketNumbers, ...Object.values(this._optionsSelectedMap)]),
            );

            optionsSelectedMapIds.forEach(id => {
                this._optionsMap[id].element.removeAttribute('c-selected');
                this._optionsMap[id].element.setAttribute('c-hidden', 'true');
            });

            Object.assign(this._categoriesMap[id].includes, this._optionsSelectedMap);

            this._optionsSelectedMap = {};
            this._optionsElement.classList.remove('disabled');
            this._changeSystemState('default');

        } else {
            if (Object.keys(this._categoriesMap[id].includes).length === 0) {
                return;
            }

            const options = Object.keys(this._categoriesMap[id].includes).reduce((acc, optionId) => {
                acc.push({
                    id: optionId,
                    TEXT: this._optionsMap[optionId].options.TEXT,
                })
                return acc;
            }, []);

            const {TEXT: categoryText} = this._categoriesMap[id].options;

            this._expandedElement.initialize(id, categoryText, options);
            this._expandedElement.show();
            this._changeSystemState('expanded');
        }
    }

    _showFancy(event) {
        const { title, text } = event.detail;
        this._popupElement.initialize(title, text);
        this._popupElement.show();
    }
}

window.customElements.define('c-categorization-mobile-worksheet', CCategorizationMobileWorksheet);