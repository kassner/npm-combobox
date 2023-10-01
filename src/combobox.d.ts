import GithubCombobox from '@github/combobox-nav';
export default class Combobox {
    input: HTMLInputElement;
    list: HTMLElement;
    selected: HTMLElement;
    comboboxController: GithubCombobox;
    constructor(inputSelector: string, listSelector: string, selectedSelector: string);
    bindEvents(): void;
    filterList(): void;
    toggleList(): void;
}
