class CCategorizationMobilePopup extends HTMLElement {
    _abortController;
    _popupElement;
    _titleElement;
    _contentElement;

    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .popup {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.4);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .popup-show {
                    opacity: 1;
                }
                .container {
                    background-color: white;
                    border-radius: 8px;
                    width: 96%;
                    max-height: 96%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #f1f1f1;
                    border-bottom: 1px solid #ccc;
                }
                .title,
                .content {
                    padding: 14px;
                    overflow-y: auto;
                    flex-grow: 1;
                }
                
                .content img,
                .content video {
                    max-width: 100%;
                }
                
                .control {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 50px;
                    height: 100%;
                }
                .control svg {
                    fill: #666666;
                    transform: scale(.6);
                }
                .d-none {
                    display: none;
                }
            </style>
            <div class="popup js-popup d-none">
                <div class="container">
                    <div class="header">
                        <div class="title js-title"></div>
                        <div class="control" role="button">
                            <svg viewBox="0 0 384 512" style="width: 24px;">
                                <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="content js-content"></div>
                </div>
            </div>`;

        this._popupElement = this.shadowRoot.querySelector('.js-popup');
        this._titleElement = this.shadowRoot.querySelector('.js-title');
        this._contentElement = this.shadowRoot.querySelector('.js-content');

        this._abortController = new AbortController();
    }

    static get observedAttributes() {
        return ['shown'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }

        switch (name) {
            case 'shown':
                this._toggleShow(newValue);
                break;
        }
    }

    connectedCallback() {
        this._abortController?.abort();
        this._abortController = new AbortController();
        this.addEventListener('click', this._close, { signal: this._abortController.signal });
    }

    disconnectedCallback() {
        this._abortController.abort();
    }

    initialize(title, content) {
        this._titleElement.innerText = title;
        this._contentElement.innerHTML = content;
    }

    close() {
        this._close();
    }

    show() {
        this.setAttribute('shown', '');
    }

    _toggleShow(shown) {
        if (shown !== null) {
            this._popupElement.classList.remove('d-none');
            setTimeout(() => {
                this._popupElement.classList.add('popup-show');
            });
        } else {
            this._popupElement.classList.remove('popup-show');
            setTimeout(() => {
                this._popupElement.classList.add('d-none');
            }, 300);
        }
    }

    _close = () => {
        this.removeAttribute('shown');
    }
}

window.customElements.define('c-categorization-mobile-popup', CCategorizationMobilePopup);