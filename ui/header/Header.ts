namespace header {

    import Component = core.Component;

    export class Header extends Component {

        private baseStyle = "header-Header";

        protected render() {
            this.addStyle(this.baseStyle);

            const logo = new Component();
            logo.addStyle(this.baseStyle + "_logo");
            this.appendChild(logo);

            const container = new Component();
            container.addStyle(this.baseStyle+ "_container");
            this.appendChild(container);

            const title = new Component();
            title.addStyle(this.baseStyle + "_title");
            title.setText("Evermere");
            container.appendChild(title);

            const subTitle = new Component();
            subTitle.addStyle(this.baseStyle + "_subtitle");
            subTitle.setText("The Last Titan");
            container.appendChild(subTitle);
            
        }

    }
}