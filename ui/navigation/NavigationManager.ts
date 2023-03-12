namespace navigation {

    import Component = core.Component;
    import Page = core.Page;


    export class NavigationManager {

        private root: Component;

        private currentPage: Page;

        private pages: Lookup<typeof Page> = {
            "STATS": stats.StatsPage,
            "CO": characteroverview.CharacterOverviewPage
        }

        public setRoot(root: core.Component) {
            this.root = root;

            window.onhashchange = e => {
                const [_, page, topic] = location.hash.split("#");
                this.navigateTo(page || "#STATS", topic || "");
            };
        }

        public navigateTo(key: string, topic?: string): void {
            if (key.startsWith("#")) {
                key = key.substring(1);
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

            location.hash = key;
        }



    }

}