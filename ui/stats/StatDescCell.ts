namespace stats {

    export class StatDescCell extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm);
        }

        protected render() {
            this.addStyle("stats-StatDescCell");
            this.setText(this.model.data["name"]);
        }

    }
}