import GithubCombobox from '@github/combobox-nav'

export default class Combobox {
    input: HTMLInputElement;
    list: HTMLElement;
    selected: HTMLElement;
    comboboxController: GithubCombobox;

    constructor(inputSelector : string, listSelector : string, selectedSelector : string) {
        this.input = document.querySelector(inputSelector);
        this.list = document.querySelector(listSelector);
        this.selected = document.querySelector(selectedSelector);

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
            this.list.hidden = true;
            this.comboboxController.clearSelection();
            this.comboboxController.stop();
        });

        this.list.addEventListener('combobox-commit', (event : Event) => {
            const target = event.target as HTMLElement;
            let content = target.textContent;

            if (target.attributes.getNamedItem('data-create')?.value == 'true') {
                content = this.input.value;
            }

            const template = this.selected.querySelector('template').cloneNode(true) as HTMLTemplateElement;
            const newHtml = template.innerHTML.replace('{{value}}', content);
            this.selected.insertAdjacentHTML('beforeend', newHtml)

            this.list.hidden = true;
            this.input.value = '';
            this.comboboxController.clearSelection();
            this.comboboxController.stop();
        })
    }

    filterList() {
        for (let item of this.list.children) {
            if (item.attributes.getNamedItem('data-create')?.value == 'true') {
                this.list.removeChild(item);
                continue;
            }

            const el = item as HTMLElement;
            item.setAttribute('hidden', el.innerText.toLowerCase().includes(this.input.value.toLowerCase()) ? 'hidden' : '');
        }

        if (this.input.value.length == 0) {
            return;
        }

        const template = this.list.querySelector('template[data-role=create]').cloneNode(true) as HTMLTemplateElement;
        const newHtml = template.innerHTML.replace('{{value}}', this.input.value);
        this.list.insertAdjacentHTML('beforeend', newHtml)
    }

    toggleList() {
        const hidden = this.input.value.length === 0;

        if (hidden) {
            this.comboboxController.stop();
        } else {
            this.comboboxController.start();
        }

        this.list.hidden = hidden;
    }
}