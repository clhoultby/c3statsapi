namespace header {

    import Component = core.Component;

    export class NavigationBar extends Component {

        private baseStyle = "header-NavigationBar";

        private links = {
            "STATS": { name: "Stats", component: new Component() },
            "CO": { name: "Characters", component: new Component() },
        };

        protected render(): void {
            this.addStyle(this.baseStyle);

            for (const l in this.links) {
                const c = this.links[l].component;
                c.addStyle(this.baseStyle + "_Link");
                c.setText(this.links[l].name);
                c.getElement().onclick = () => {
                    Locator.navigationManager.navigateTo(l);
                };
                this.appendChild(c);
            }

            Locator.navigationManager.addDelegate(this);
        }

        public navigationChanged(key: string) {
            for (const link in this.links) {
                const c = this.links[link].component;

                if (link === key) {
                    c.addStyle(this.baseStyle + "-Selected");
                } else {
                    c.removeStyle(this.baseStyle + "-Selected");
                }
            }
        }
    }
}