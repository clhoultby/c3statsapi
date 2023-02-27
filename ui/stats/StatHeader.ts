namespace stats {

    export class StatHeader extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm, "tr");
        }

        protected render(): void {
            this.addStyle("stats-StatHeader");

            for (const c of this.model.getChildren()) {
                const cell = new core.Component("td");
                cell.addStyle("stats-StatHeader_cell");
                cell.setText(c.data["name"]);
                this.appendChild(cell);
            }
        }
    }
}