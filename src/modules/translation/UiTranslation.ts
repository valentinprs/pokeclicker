import i18next from 'i18next';

interface TranslationTree {
    [key: string]: string | TranslationTree;
}
type UiAttribute = 'title' | 'placeholder' | 'aria-label' | 'alt' | 'value';

const TRANSLATABLE_ATTRIBUTES: UiAttribute[] = ['title', 'placeholder', 'aria-label', 'alt', 'value'];
const TEXT_PARENT_TAG_BLACKLIST = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);
const INPUT_TYPES_WITH_TRANSLATABLE_VALUE = new Set(['button', 'submit', 'reset']);

class UiTranslation {
    private initialized = false;
    private observer?: MutationObserver;
    private keyByEnglishText = new Map<string, string>();
    private defaultByKey = new Map<string, string>();
    private textNodeKey = new WeakMap<Text, string>();
    private textNodeDefaultText = new WeakMap<Text, string>();
    private observerQueued = false;

    public initialize() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;

        i18next.on('initialized', () => this.prepareAndTranslateAll());
        i18next.on('languageChanged', () => this.translateAll());

        if (i18next.isInitialized) {
            this.prepareAndTranslateAll();
        }
    }

    private prepareAndTranslateAll() {
        this.ensureEnglishUiBundleLoaded(() => {
            this.hydrateLookupMaps();
            this.translateAll();
            this.observeDomMutations();
        });
    }

    private ensureEnglishUiBundleLoaded(callback: () => void) {
        const hasEnglishBundle = !!i18next.getResourceBundle('en', 'ui');
        if (hasEnglishBundle) {
            callback();
            return;
        }

        (i18next as any).loadLanguages?.('en', () => callback());
    }

    private hydrateLookupMaps() {
        this.keyByEnglishText.clear();
        this.defaultByKey.clear();

        const bundle = i18next.getResourceBundle('en', 'ui') as TranslationTree | undefined;
        if (!bundle || typeof bundle !== 'object') {
            return;
        }

        const walkTree = (node: TranslationTree, keyPrefix = '') => {
            Object.entries(node).forEach(([part, value]) => {
                const fullKey = keyPrefix ? `${keyPrefix}.${part}` : part;
                if (typeof value === 'string') {
                    this.defaultByKey.set(fullKey, value);
                    if (!this.keyByEnglishText.has(value)) {
                        this.keyByEnglishText.set(value, fullKey);
                    }
                    return;
                }
                walkTree(value, fullKey);
            });
        };

        walkTree(bundle);
    }

    private observeDomMutations() {
        if (this.observer) {
            return;
        }

        this.observer = new MutationObserver((mutations) => {
            if (!mutations.length || this.observerQueued) {
                return;
            }

            this.observerQueued = true;
            window.requestAnimationFrame(() => {
                this.observerQueued = false;
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => this.translateSubtree(node));
                });
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    private translateAll() {
        this.translateSubtree(document.body);
    }

    private translateSubtree(node: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
            this.translateTextNode(node as Text);
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const rootElement = node as Element;
        this.translateElementAttributes(rootElement);

        const treeWalker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT);
        while (treeWalker.nextNode()) {
            this.translateTextNode(treeWalker.currentNode as Text);
        }

        rootElement.querySelectorAll('*').forEach((element) => this.translateElementAttributes(element));
    }

    private translateTextNode(node: Text) {
        if (!node || !node.parentElement || TEXT_PARENT_TAG_BLACKLIST.has(node.parentElement.tagName)) {
            return;
        }

        const rawText = node.nodeValue ?? '';
        const trimmedText = rawText.trim();
        if (!trimmedText.length) {
            return;
        }

        let uiKey = this.textNodeKey.get(node);
        if (!uiKey) {
            uiKey = this.keyByEnglishText.get(trimmedText);
            if (!uiKey) {
                return;
            }
            this.textNodeKey.set(node, uiKey);
            this.textNodeDefaultText.set(node, trimmedText);
        }

        const defaultText = this.textNodeDefaultText.get(node)
            ?? this.defaultByKey.get(uiKey)
            ?? trimmedText;
        const translatedText = i18next.t(uiKey, { ns: 'ui', defaultValue: defaultText });
        const leadingWhitespace = rawText.match(/^\s*/)?.[0] ?? '';
        const trailingWhitespace = rawText.match(/\s*$/)?.[0] ?? '';
        const nextText = `${leadingWhitespace}${translatedText}${trailingWhitespace}`;

        if (rawText !== nextText) {
            node.nodeValue = nextText;
        }
    }

    private translateElementAttributes(element: Element) {
        TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
            if (!element.hasAttribute(attribute)) {
                return;
            }
            if (attribute === 'value' && !this.isTranslatableValueAttribute(element)) {
                return;
            }

            const keyStoreAttribute = `data-ui-i18n-${attribute}-key`;
            const defaultStoreAttribute = `data-ui-i18n-${attribute}-default`;

            let uiKey = element.getAttribute(keyStoreAttribute);
            const currentValue = element.getAttribute(attribute) ?? '';
            const trimmedValue = currentValue.trim();

            if (!uiKey && trimmedValue.length) {
                uiKey = this.keyByEnglishText.get(trimmedValue);
                if (uiKey) {
                    element.setAttribute(keyStoreAttribute, uiKey);
                    element.setAttribute(defaultStoreAttribute, trimmedValue);
                }
            }

            if (!uiKey) {
                return;
            }

            const defaultText = element.getAttribute(defaultStoreAttribute)
                ?? this.defaultByKey.get(uiKey)
                ?? trimmedValue;
            const translatedText = i18next.t(uiKey, { ns: 'ui', defaultValue: defaultText });
            if (currentValue !== translatedText) {
                element.setAttribute(attribute, translatedText);
            }
        });
    }

    private isTranslatableValueAttribute(element: Element) {
        if (element.tagName !== 'INPUT') {
            return false;
        }
        const inputType = ((element as HTMLInputElement).type || '').toLowerCase();
        return INPUT_TYPES_WITH_TRANSLATABLE_VALUE.has(inputType);
    }
}

export default new UiTranslation();
