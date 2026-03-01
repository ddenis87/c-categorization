import './c-categorization-gallery-item.js';
import '../c-categorization-items-list.js';
import {EVENT_EXTRACT, EVENT_EXTRACT_ALL, EVENT_FANCY, EVENT_SELECT, EVENT_UNSELECT} from "@/components/enum";

const CCategorizationGalleryWorksheetSheet = new CSSStyleSheet();
CCategorizationGalleryWorksheetSheet.replaceSync(`
    .worksheet {
        position: relative;
        display: grid;
        grid-template-areas: "wrap-options" "wrap-categories";
        grid-template-rows: calc(50% - 4px) calc(50% - 4px);
        grid-template-columns: minmax(0, 1fr);
        gap: 8px;
        padding: 4px;
        height: calc(100% - 8px);
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
    
    .list {
        position: relative;
        display: flex;
        gap: 8px;
        padding: 4px 18px;
        height: 100%;
        overflow: hidden;
        overflow-x: auto;
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
`);

class CCategorizationGalleryWorksheet extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [CCategorizationGalleryWorksheetSheet];
        this.shadowRoot.innerHTML = `
            <div class="worksheet">
                <div class="wrap-options">
                    <div class="options js-options">
                        <div class="title js-options-title">Options</div>
                        <div class="list js-list"></div>
                    </div>
                </div>
                <div class="wrap-categories">
                    <div class="categories js-categories">
                        <div class="title js-categories-title">Categories</div>
                        <div class="list js-list"></div>
                    </div>
                </div>
                <c-categorization-items-list></c-categorization-items-list>
            </div>
        `;
    }

    connectedCallback() {
        this._abortController = new AbortController();

        this._optionsElement = this.shadowRoot.querySelector('.js-options');
        // this._optionsScrollIndicatorElement = this.shadowRoot.querySelector('.js-options-scroll-indicator');
        // this._topTitleElement = this.shadowRoot.querySelector('.js-options-title'); // ??
        this._categoriesElement = this.shadowRoot.querySelector('.js-categories');
        // this._categoriesScrollIndicatorElement = this.shadowRoot.querySelector('.js-categories-scroll-indicator');
        // this._bottomTitleElement = this.shadowRoot.querySelector('.js-categories-title'); // ??
        // this._popupElement = this.shadowRoot.querySelector('c-categorization-mobile-popup');
        this._expandedElement = this.shadowRoot.querySelector('c-categorization-items-list');

        this._optionsMap = {};
        this._categoriesMap = {};
        this._optionsSelectedMap = {};

        this._registerListeners();
    }

    initialize(options, categories, numberOfResponses) {
        const {title: optionsTitle, data: optionsData} = options;
        const {title: categoriesTitle, data: categoriesData} = categories;

        ({from: this._from, to: this._to} = numberOfResponses);

        // this._initializeOptionsTitle(optionsTitle);
        this._initializeOptions(optionsData);

        // this._initializeCategoriesTitle(categoriesTitle);
        this._initializeCategories(categoriesData);
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

    _initializeOptions(optionsMap) {
        this._optionsMap = {};
        // Clear existing items
        const list = this._optionsElement.querySelector('.js-list');
        list.innerHTML = '';

        // Add top options
        optionsMap.forEach((options, index) => {
            const itemElement = document.createElement('c-categorization-gallery-item');
            const itemProps = {
                group: 'options',
                id: options.id,
                text: options.TEXT,
                bucketNumber: index + 1,
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

        // this._toggleScrollIndicator(this._optionsElement, this._optionsScrollIndicatorElement);
    }

    _initializeCategories(categoriesMap) {
        this._categoriesMap = {};
        // Clear existing items
        const list = this._categoriesElement.querySelector('.js-list');
        list.innerHTML = '';

        // Add bottom options
        categoriesMap.forEach((options) => {
            const itemElement = document.createElement('c-categorization-gallery-item');
            const itemProps = {
                group: 'categories',
                id: options.id,
                text: options.TEXT,
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

        // this._toggleScrollIndicator(this._categoriesElement, this._categoriesScrollIndicatorElement);
    }

    _registerListeners() {
        this._abortController?.abort();

        this._abortController = new AbortController();

        // this event may be triggered outside of this component
        this.addEventListener(EVENT_UNSELECT, this._onUnselect.bind(this), {signal: this._abortController.signal});
        this.addEventListener(EVENT_EXTRACT_ALL, this._onExtractAll.bind(this), {signal: this._abortController.signal});
        this.addEventListener(EVENT_EXTRACT, this._onExtract.bind(this), {signal: this._abortController.signal});
        this.addEventListener(EVENT_SELECT, this._onSelect.bind(this), {signal: this._abortController.signal});
    }

    _onExtract(event) {
        const { categoryId, optionId } = event.detail;
        this._optionsMap[optionId].element.removeAttribute('s-hidden');
        this._optionsMap[optionId].element.removeAttribute('hidden');
        const includesBuckets = JSON.parse(this._categoriesMap[categoryId].element.getAttribute('s-includes') || '[]');

        const bucketNumber = this._categoriesMap[categoryId].includes[optionId];
        includesBuckets.splice(includesBuckets.indexOf(bucketNumber), 1);

        if (includesBuckets.length === 0) {
            this._categoriesMap[categoryId].element.removeAttribute('s-includes');
        } else {
            this._categoriesMap[categoryId].element.setAttribute(
                's-includes',
                JSON.stringify(includesBuckets),
            );
        }
        delete this._categoriesMap[categoryId].includes[optionId];
    }

    _onExtractAll() {
        const categoryId = this._expandedElement.getAttribute('category-id');
        this._categoriesMap[categoryId].element.removeAttribute('s-includes');
        Object.keys(this._categoriesMap[categoryId].includes).forEach(optionId => {
            this._optionsMap[optionId].element.removeAttribute('s-hidden');
            this._optionsMap[optionId].element.removeAttribute('hidden');
        });
        this._categoriesMap[categoryId].includes = {};

        this._expandedElement.dispatchEvent(new CustomEvent(EVENT_EXTRACT_ALL));
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
            this._optionsMap[id].element.removeAttribute('s-selected');
        });
        this._optionsSelectedMap = {};
        this._optionsElement.classList.remove('disabled');
        this._changeSystemState('default');
    }

    _selectCategory(id) {
        const optionsSelectedMapIds = Object.keys(this._optionsSelectedMap);
        if (optionsSelectedMapIds.length) {
            const currentIncludesBucketNumbers = JSON.parse(this._categoriesMap[id].element.getAttribute('s-includes') || '[]');

            if ((currentIncludesBucketNumbers.length + optionsSelectedMapIds.length) > this._to) {
                this._categoriesMap[id].element.setAttribute('s-cancelled', 'true');
                return;
            }

            this._categoriesMap[id].element.setAttribute(
                's-includes',
                JSON.stringify([...currentIncludesBucketNumbers, ...Object.values(this._optionsSelectedMap)]),
            );

            optionsSelectedMapIds.forEach(id => {
                this._optionsMap[id].element.removeAttribute('s-selected');
                this._optionsMap[id].element.setAttribute('s-hidden', 'true');
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
                    FANCY_TEXT: this._optionsMap[optionId].options.FANCY_TEXT,
                })
                return acc;
            }, []);

            const {TEXT: text, FANCY_TEXT: fancy} = this._categoriesMap[id].options;
            const categoryTexts = {text, fancy};

            this._expandedElement.initialize(id, categoryTexts, options, 'c-categorization-gallery-item');
            this._expandedElement.show();
            this._changeSystemState('expanded');
        }
    }

    _selectOption(id, bucketNumber) {
        const isSelected = this._optionsMap[id].element.attributes.hasOwnProperty('s-selected');
        if (isSelected) {
            delete this._optionsSelectedMap[id];
            this._optionsMap[id].element.removeAttribute('s-selected')
        } else {
            this._optionsSelectedMap[id] = bucketNumber;
            this._optionsMap[id].element.setAttribute('s-selected', 'true');
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
}

customElements.define('c-categorization-gallery-worksheet', CCategorizationGalleryWorksheet);