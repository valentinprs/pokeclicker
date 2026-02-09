import i18next from 'i18next';

type LocationCategory = 'routes' | 'towns' | 'dungeons' | 'map';
type LocationTranslations = Record<string, string>;

function getCategoryTranslations(category: LocationCategory): LocationTranslations {
    const categoryTranslations = i18next.t(category, {
        ns: 'locations',
        returnObjects: true,
        defaultValue: {},
    });

    if (typeof categoryTranslations === 'object' && categoryTranslations != null) {
        return categoryTranslations as LocationTranslations;
    }

    return {};
}

function tryTranslate(category: LocationCategory, name: string): string | null {
    const key = `${category}.${name}`;
    const directTranslation = i18next.t(key, {
        ns: 'locations',
        defaultValue: key,
    });

    // Fallback for keys containing periods, which i18next treats as path separators.
    if (directTranslation !== key) {
        return directTranslation;
    }

    const categoryTranslations = getCategoryTranslations(category);
    if (typeof categoryTranslations[name] === 'string') {
        return categoryTranslations[name];
    }

    return null;
}

function getTranslatedName(category: LocationCategory, name: string): string {
    if (!name) {
        return name;
    }

    return tryTranslate(category, name) ?? name;
}

export function routeName(name: string): string {
    return getTranslatedName('routes', name);
}

export function townName(name: string): string {
    return getTranslatedName('towns', name);
}

export function dungeonName(name: string): string {
    return getTranslatedName('dungeons', name);
}

export function mapName(name: string): string {
    return getTranslatedName('map', name);
}

export function anyLocationName(name: string): string {
    if (!name) {
        return name;
    }

    const categories: LocationCategory[] = ['map', 'towns', 'dungeons', 'routes'];
    let fallback = name;
    for (const category of categories) {
        const translated = tryTranslate(category, name);
        if (translated === null) {
            continue;
        }
        if (translated !== name) {
            return translated;
        }
        fallback = translated;
    }
    return fallback;
}
