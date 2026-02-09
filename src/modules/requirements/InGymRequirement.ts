import { AchievementOption } from '../GameConstants';
import Requirement from './Requirement';
import * as LocationHelper from '../translation/LocationHelper';

export default class InGymRequirement extends Requirement {
    constructor(public gymTown: string, option = AchievementOption.more) {
        super(1, option);
    }

    public getProgress() {
        return Number(GymRunner.gymObservable().town === this.gymTown);
    }

    public hint(): string {
        return `You must be in the ${
            LocationHelper.townName(this.gymTown)
        } gym.`;
    }
}
