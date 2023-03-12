namespace characteroverview {

    import Page = core.Page;
    import IPage = core.IPage;

    export class CharacterOverviewPage extends Page implements IPage {

        protected render(): void {
            super.render();
            this.addStyle("co-CharacterOverviewPage");
        }

        public navigateTo(topic: string) {
            Locator.connection.subscribe("CO", this);
        }

        public subscriptionReady(dm: data.DataModel): void {

            for (const model of dm.getChildren()) {
                const c = new OVCharacter(model);
                this.appendChild(c);
            }
        }

    }
}