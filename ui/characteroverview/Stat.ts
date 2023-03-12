namespace characteroverview {

    import Component = core.Component;

    export class Stat extends core.DataComponent {

        private baseStyle = "co-Stat";

        protected render(): void {
            this.addStyle(this.baseStyle);

            const value = new Component();
            value.addStyle(this.baseStyle + "_Value");
            value.setText(this.model.data["value"]);
            this.appendChild(value);

            const desc = new Component();
            desc.addStyle(this.baseStyle + "_Desc");
            desc.setText(this.model.data["desc"]);
            this.appendChild(desc);
        }
    }
}