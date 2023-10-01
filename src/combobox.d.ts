import GithubCombobox from '@github/combobox-nav';
export default class Combobox {
    input: HTMLInputElement;
    list: HTMLElement;
    selected: HTMLElement;
    comboboxController: GithubCombobox;
    constructor(inputEl: string, listEl: string, selectedEl: string);
    bindEvents(): void;
    filterList(): void;
    toggleList(): void;
}
