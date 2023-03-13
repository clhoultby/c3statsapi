namespace navigation {

    import Component = core.Component;
    import Page = core.Page;


    export class NavigationManager {

        private root: Component;

        private currentPage: Page;

        private currentKey: string;

        private pages: Lookup<typeof Page> = {
            "STATS": stats.StatsPage,
            "CO": characteroverview.CharacterOverviewPage
        }

        private delegates: {navigationChanged: (string) => void}[] = [];


        public addDelegate(delegate: {navigationChanged: (string) => void}): void {
            this.delegates.push(delegate);
            delegate.navigationChanged(this.currentKey);
        }

        public getCurrentLocation(): string {
            return this.currentKey;
        }

        public setRoot(root: core.Component) {
            this.root = root;

            // window.onhashchange = e => {
            //     const [_, page, topic] = location.hash.split("#");
            //     this.navigateTo(page || "STATS", topic || "");
            // };
        }

        public navigateTo(key: string, topic?: string): void {
            if (key.startsWith("#")) {
                key = key.substring(1);
            }

            if (key === this.currentKey) {
                return;
            }
            
            const page = this.pages[key];
            if (!page) {
                console.error("unsupported pageType");
                return;
            }

            if (this.currentPage) {
                this.root.removeChild(this.currentPage);
            }

            this.root.appendChild(this.currentPage = new page());
            this.currentPage.navigateTo(topic);

            location.hash = this.currentKey = key;


            for (const d of this.delegates) {
                d.navigationChanged(key);
            }
        }

    }
}