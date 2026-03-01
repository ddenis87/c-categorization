import '../c-system-bar.js';
import './c-categorization-gallery-worksheet.js';
import CCategorizationLayoutMobile from '@/components/layout/c-categorization-layout-mobile';

class CCategorizationGallery extends CCategorizationLayoutMobile {
    constructor() {
        super();

        this.shadowRoot.innerHTML = `
            <div class="c-container">
                <c-system-bar class="c-system-bar"></c-system-bar>
                <c-categorization-gallery-worksheet class="c-worksheet"></c-categorization-gallery-worksheet>
            </div>
        `;
    }
}

window.customElements.define('c-categorization-gallery', CCategorizationGallery);