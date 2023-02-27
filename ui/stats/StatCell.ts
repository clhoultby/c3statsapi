namespace stats {

    export class StatCell extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm, "td");
        }

        protected render(): void {
            this.addStyle("stats-StatCell");
            this.setText(this.model.data["value"]);
        }
    }
}