import type { PureComputed } from 'knockout';
import { createLogContent, LogContent, LogContentKey } from './helpers';
import { LogBookType } from './LogBookTypes';
import { TranslationVars } from '../translation/Translation';
import * as LocationHelper from '../translation/LocationHelper';

export default class LogBookLog {
    public description = this.content.key === LogContentKey.notTranslated
        ? this.content.vars.text
        : App.translation.get(this.content.key, 'logbook', this.contentVarsWithTranslatedLocation());

    constructor(
        public type: LogBookType = {
            display: 'dark',
            label: 'OTHER',
        },
        public content: LogContent = createLogContent.notTranslated({ text: 'Unknown Entry' }),
        public date: number = Date.now(),
    ) {}

    get displayLabel(): PureComputed<string> {
        return App.translation.get(
            `type.${this.type.label}`,
            'logbook',
        );
    }

    private contentVarsWithTranslatedLocation(): TranslationVars | undefined {
        const vars = this.content.vars;
        if (typeof vars?.location !== 'string') {
            return vars;
        }

        const contentVars = { ...vars };
        const locationName = vars.location;
        Object.defineProperty(contentVars, 'location', {
            enumerable: true,
            configurable: true,
            get: () => LocationHelper.anyLocationName(locationName),
        });
        return contentVars;
    }
}
