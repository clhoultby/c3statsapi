namespace stats {

    export class StatCell extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm, "td");
        }

        protected render(): void {
            this.addStyle("stats-StatCell");
            this.setText(this.model.data["value"]);
        }

        public update(data: Map<string, string>): void {
            this.setText(data["value"]);
            this.addStyle("stats-StatCell-updated");

            window.setTimeout(()=> {
                this.removeStyle("stats-StatCell-updated");
            }, 1000)

        }
    }
}