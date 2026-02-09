import * as GameConstants from '../GameConstants';
import AchievementRequirement from './AchievementRequirement';
import * as LocationHelper from '../translation/LocationHelper';

export default class ClearDungeonRequirement extends AchievementRequirement {
    public dungeonIndex: number; // Dungeon name index in array GameConstants.RegionDungeons.flat()

    constructor(value: number, dungeonIndex: number, option: GameConstants.AchievementOption = GameConstants.AchievementOption.more) {
        super(value, option, GameConstants.AchievementType['Clear Dungeon']);
        this.dungeonIndex = dungeonIndex;
    }

    public getProgress() {
        return Math.min(App.game.statistics.dungeonsCleared[this.dungeonIndex](), this.requiredValue);
    }

    public hint(): string {
        const dungeonName = LocationHelper.dungeonName(GameConstants.RegionDungeons.flat()[this.dungeonIndex]);
        if (this.requiredValue === 1) {
            return `${dungeonName} needs to be completed.`;
        }
        return `${dungeonName} needs to be completed ${this.requiredValue} times.`;
    }

    public toString(): string {
        return `${super.toString()} ${this.dungeonIndex}`;
    }
}
