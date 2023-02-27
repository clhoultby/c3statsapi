namespace stats {

    export class CharCell extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm, "td");
        }

        protected render() {
            debugger;
            this.addStyle("stats-CharCell");
            this.setText(this.model.data["name"]);
        }

    }
}