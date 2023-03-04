namespace stats {

    import Component = core.Component;

    export class CharCell extends core.DataComponent {

        private baseStyle = "stats-CharCell";

        protected render() {
            this.addStyle(this.baseStyle);

            const img = new Component();
            img.addStyle(this.baseStyle + "_img");
            img.getElement().setAttribute("style", `background-image:url("${this.model.data["img"]}")`)
            this.appendChild(img);

            const name = new Component();
            name.addStyle(this.baseStyle + "_name");
            name.setText(this.model.data["name"]);
            this.appendChild(name);

            const secondName = new Component();
            secondName.addStyle(this.baseStyle + "_secondname");
            secondName.setText(this.model.data["secondName"] || "");
            this.appendChild(secondName);
        }

    }
}