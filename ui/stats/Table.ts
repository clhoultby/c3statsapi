namespace stats {

    export class Table extends core.DataComponent {

        constructor(dm: data.DataModel) {
            super(dm);
        }

        protected render() {
            this.addStyle("stats-Table");

            const header = new StatHeader(this.model.getChildren()[0]);
            this.appendChild(header);

            for (const dm of this.model.getChildren()) {
                const row = new StatRow(dm);
                this.appendChild(row);

            }
        }

    }

}