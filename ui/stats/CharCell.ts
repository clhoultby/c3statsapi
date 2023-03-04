namespace stats {

    export class CharCell extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm);
        }

        protected render() {
            this.addStyle("stats-CharCell");
            this.setText(this.model.data["name"]);
        }

    }
}