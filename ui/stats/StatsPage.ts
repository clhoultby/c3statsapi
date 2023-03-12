namespace stats {

    export class StatsPage extends core.Page implements core.IPage {

        protected render(): void {
            this.addStyle("stats-StatsPage");
        }

        public navigateTo(topic: string) {
            Locator.connection.subscribe("STATS", this);
        }

        public subscriptionReady(dm: data.DataModel): void {
            const table = new stats.Table(dm);
            this.appendChild(table);
        }
    }
}