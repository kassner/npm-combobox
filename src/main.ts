import GithubCombobox from '@github/combobox-nav'

export type ComboboxOptions = {
    disableSelected: boolean;
    replaceString: string | null;
};

export default class Combobox {
    options: ComboboxOptions;
    input: HTMLInputElement;
    list: HTMLElement;
    selected: HTMLElement;
    comboboxController: GithubCombobox;

    constructor(inputSelector: string, listSelector: string, selectedSelector: string, options: ComboboxOptions = {
        disableSelected: false,
        replaceString: '{{value}}',
    }) {
        this.options = options;
        this.input = document.querySelector(inputSelector) as HTMLInputElement;
        this.list = document.querySelector(listSelector) as HTMLElement;
        this.selected = document.querySelector(selectedSelector) as HTMLElement;

        this.comboboxController = new GithubCombobox(this.input, this.list);
        this.bindEvents();
    }

    bindEvents() {
        this.input.addEventListener('input', () => {
            this.filterList();
            this.toggleList();
        });

        this.input.addEventListener('focus', () => this.toggleList());
        this.input.addEventListener('blur', () => {
            /**
             * setTimeout added to mitigate upstream issue.
             *
             * @see https://github.com/github/combobox-nav/issues/54
             */
            setTimeout(() => {
                this.list.setAttribute('hidden', 'hidden');
                this.comboboxController.clearSelection();
                this.comboboxController.stop();
            }, 50);
        });

        this.list.addEventListener('combobox-commit', (event: Event) => {
            const target = event.target as HTMLElement;
            let content = target.textContent || '';

            if (target.attributes.getNamedItem('data-create')?.value == 'true') {
                content = this.input.value;
            }

            const template = this.selected.querySelector('template')?.cloneNode(true) as HTMLTemplateElement;
            const newHtml = this.options.replaceString == null ? template.innerHTML : replaceAll(template.innerHTML, this.options.replaceString, escapeHtml(content));
            this.selected.insertAdjacentHTML('beforeend', newHtml.trim());

            if (this.options.disableSelected != true) {
                target.setAttribute('aria-disabled', 'true');
            }

            this.list.setAttribute('hidden', 'hidden');
            this.input.value = '';
            this.comboboxController.clearSelection();
            this.comboboxController.stop();
        });

        /**
         * Can be removed once upstream is fixed
         * @see https://github.com/github/combobox-nav/issues/54
         */
        this.list.addEventListener('mousedown', (event) => {
            const target = event.target as HTMLElement;
            if (target.matches('[role=option]')) {
                const ev = new CustomEvent('combobox-commit', { bubbles: true, detail: { event } });
                target.dispatchEvent(ev);
            }
        });

        this.list.addEventListener('mouseover', (event) => {
            const target = event.target as HTMLElement;
            if (target.matches('li')) {
                this.list.querySelectorAll('li[aria-selected=true]').forEach((value: Element) => {
                    value.removeAttribute('aria-selected');
                });
                target.setAttribute('aria-selected', 'true');
            }
        });

        this.selected.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.matches('[role=remove]') || target.closest('[role=remove]')) {
                target.closest('[role=listitem]')?.remove();
            }
        });
    }

    filterList() {
        this.list.querySelectorAll('[data-create=true]').forEach(item => item.remove());

        for (let item of this.list.children) {
            const el = item as HTMLElement;
            if (el.innerText.toLowerCase().includes(this.input.value.toLowerCase())) {
                item.removeAttribute('hidden');
            } else {
                item.setAttribute('hidden', 'hidden');
            }
        }

        if (this.input.value.length == 0) {
            return;
        }

        const createTemplate = this.list.querySelector('template[data-role=create]');
        if (createTemplate != undefined) {
            const template = createTemplate.cloneNode(true) as HTMLTemplateElement;
            const newHtml = this.options.replaceString == null ? template.innerHTML : replaceAll(template.innerHTML, this.options.replaceString, escapeHtml(this.input.value));
            this.list.insertAdjacentHTML('beforeend', newHtml.trim());
        }
    }

    toggleList() {
        const hidden = this.input.value.length === 0;

        if (hidden) {
            this.list.setAttribute('hidden', 'hidden');
            this.comboboxController.stop();
        } else {
            this.list.removeAttribute('hidden');
            this.comboboxController.start();
        }
    }
}

/**
 * @link https://stackoverflow.com/a/6234804/430989
 */
const escapeHtml = (text: string): string => {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const regExpEscape = (text: string): string => {
    return text.replace(/[$-\/?[-^{|}]/g, '\\$&');
};

const replaceAll = (text: string, search: string, replacement: string): string => {
    return text.replace(new RegExp(regExpEscape(search), 'g'), replacement);
};
